import { Button, Card, Col, Row } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";
import Spinner from "react-bootstrap/Spinner";
import axios from "axios";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { isLoading, user } = useAuth0();
  const [topLikedListings, setTopLikedListings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/listings/top9`
      );
      setTopLikedListings(data);
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div>
        <Button variant="primary" disabled>
          <Spinner as="span" animation="grow" size="sm" />
          Loading...
        </Button>
      </div>
    );
  }

  if (!isLoading && user) {
    axios.post(`${process.env.REACT_APP_BACKEND_URL}/users`, {
      email: user.email,
      name: user.nickname,
      profilePicUrl: user.picture,
      onlineStatus: true,
    });
  }
  return (
    <div>
      <Row xs={1} md={3} className="g-4">
        {topLikedListings.map((listing) => (
          <Col key={listing.id}>
            <Card className="card">
              <div className="files-container">
                {listing.files && listing.files.length > 0 && (
                  <Card.Img
                    variant="top"
                    src={listing.files[0].url}
                    className="files"
                  />
                )}
              </div>
              <Card.Body>
                <Card.Footer>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Beating_Heart.gif"
                    alt="liked"
                    className="liked"
                  />
                  <small>{listing.likeCount}</small>
                </Card.Footer>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
