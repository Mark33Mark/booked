import React from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Jumbotron, Container, CardColumns, Card, Button } from "react-bootstrap";

import { GET_ME } from "../utils/queries";
import { REMOVE_BOOK } from "../utils/mutations";

import Auth from "../utils/auth";
import { removeBookId } from "../utils/localStorage";


const SavedBooks = () => {
  const { loading, data } = useQuery( GET_ME );

  const userData = data?.me || {};

  const [removeBook] = useMutation( REMOVE_BOOK );

  // use this to determine if `useEffect(  )` hook needs to run again
  const handleDeleteBook = async ( bookId ) => {

    const token = Auth.loggedIn() ? Auth.getToken(): null;

    if ( !token ) {
      return false;
    }
    try {
      await removeBook( {
        variables: { bookId: bookId }
      } );
      removeBookId( bookId );
    }catch ( err ) {
      console.error( err );
    }
  };
  if ( loading ) {
    return <h2>...still loading, give me a second.</h2>;
  }

  return ( 
    <>
      <Jumbotron fluid className="text-light bg-dark">
        <Container>
          <h4>{Auth.getProfile(  ).data.username}'s </h4>
          <h1>Reading List</h1>
        </Container>
      </Jumbotron>
      <Container>
        <h2>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? "book" : "books"}:`
            : "You have no saved books!"}
        </h2>
        <CardColumns>
          {userData.savedBooks.map( ( book ) => {
            return ( 
              <Card key={book.bookId} border="dark">
                {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant="top" /> : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors}</p>
                  <Card.Text><a href={book.link} target="_blank" rel="noreferrer" >
                                Click here to see me at: <img src="./assets/google-books_icon.png" alt="Google Books" width="30%"/>
                              </a>
                  </Card.Text>
                  <Card.Text>{book.description}</Card.Text>
                  <Button className="btn-block btn-danger" onClick={() => handleDeleteBook( book.bookId )}>
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            );
          } )}
        </CardColumns>
      </Container>
    </>
  );
};

export default SavedBooks;

