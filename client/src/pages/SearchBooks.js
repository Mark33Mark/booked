
import React, { useState, useEffect } from "react";
import { Jumbotron, Container, Row, Col, Form, Button, Card, CardColumns } from "react-bootstrap";

import { useMutation } from "@apollo/client";
import { SAVE_BOOK } from "../utils/mutations";

import Auth from "../utils/auth";
import { searchGoogleBooks } from "../utils/API";
import { saveBookIds, getSavedBookIds } from "../utils/localStorage";


const SearchBooks = () => {

  // state for holding returned google api data
  const [searchedBooks, setSearchedBooks] = useState( [] );

  // state for holding our search field data
  const [searchInput, setSearchInput] = useState( "" );

  // state to hold saved bookId values
  const [savedBookIds, setSavedBookIds] = useState( getSavedBookIds() );

  const [saveBook] = useMutation( SAVE_BOOK );
  
  // hook to save `savedBookIds` list to localStorage on component unmount
  useEffect( () => {
    return () => saveBookIds( savedBookIds );
  } );

  // method to search for books and set state on form submit
  const handleFormSubmit = async ( event ) => {
    event.preventDefault(  );

    if ( !searchInput ) {
      return false;
    }

    try {
      const response = await searchGoogleBooks( searchInput );

      if ( !response.ok ) {
        throw new Error( "something went wrong!" );
      }

      const { items } = await response.json(  );
      console.log( {items} ); 

      const bookData = items.map( ( book ) => ( {
        bookId: book.id,
        authors: book.volumeInfo.authors || [ "No author to display" ],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || "",
        link: book.volumeInfo.canonicalVolumeLink,
      } ) );

      setSearchedBooks( bookData );
      setSearchInput( "" );
    } catch ( err ) {
      console.error( err );
    }
  };


  // function to handle saving a book to our database
  const handleSaveBook = async ( bookId ) => {
    
    // find the book in `searchedBooks` state by the matching id
    const bookToSave = searchedBooks.find( ( book ) => book.bookId === bookId );

    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    console.log( Auth.loggedIn() );

    if ( !token ) {
      return false;
    }

    try {
      await saveBook({
        variables: {book: bookToSave }
      } );
      
      // if book successfully saves to user"s account, save book id to state
      setSavedBookIds( [...savedBookIds, bookToSave.bookId] );
    } catch ( err ) {
      console.error( err );
    }
  };

  return ( 
    <>
      <Jumbotron fluid className="text-light bg-dark">
        <Container>
          <Row>
          <Col>{Auth.loggedIn() 
                  ? ( 
                    <h4>Welcome: {Auth.getProfile(  ).data.username} </h4>
                    ):( <h4>Welcome visitor, please login or sign up.</h4>
                  )}

            <h1>Search for Books</h1>
            </Col>
            </Row>

          <Form onSubmit={handleFormSubmit}>
            <Form.Row>
              <Col xs={12} md={6}>
                <Form.Control
                  name="searchInput"
                  value={searchInput}
                  onChange={( e ) => setSearchInput( e.target.value )}
                  type="text"
                  size="lg"
                  placeholder="search: book name, subject, author?"
                />
              </Col>
              <Col xs={12} md={6}>
                <Button type="submit" variant="success" size="lg">
                  Submit Search
                </Button>
              </Col>
            </Form.Row>
          </Form>
        </Container>
      </Jumbotron>

      <Container>
        <h2>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : "Search for a book to begin"}
        </h2>
        <CardColumns>
          {searchedBooks.map( ( book ) => {
            return ( 
              <Card key={book.bookId} border="dark">
                {book.image ? ( 
                  <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant="top" />
                ) : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors}</p>
                  <Card.Text><a href={book.link} target="_blank" rel="noreferrer" >
                                Click here to see me at: <img src="./assets/google-books_icon.png" alt="Google Books" width="30%"/>
                              </a>
                  </Card.Text>
                  <Card.Text>{book.description}</Card.Text>
                  {Auth.loggedIn() && ( 
                    <Button
                      disabled={savedBookIds?.some( ( savedBookId ) => savedBookId === book.bookId )}
                      className={savedBookIds?.some(  savedBookId => savedBookId === book.bookId )
                        ? "btn-block btn-success"
                        : "btn-block btn-info" }
                      onClick={() => handleSaveBook( book.bookId )}>
                      {savedBookIds?.some(  savedBookId => savedBookId === book.bookId )
                        ? "☑️ saved in your reading list ☑️ "
                        : "Save to your reading list?"}
                    </Button>
                  )}
                </Card.Body>
              </Card>
            );
          } )}
        </CardColumns>
      </Container>
    </>
  );
};

export default SearchBooks;
