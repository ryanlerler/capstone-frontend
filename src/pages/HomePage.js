import { Button, Card, Col, Row } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";
import Spinner from "react-bootstrap/Spinner";
import axios from "axios";

export default function HomePage() {
  const { isLoading, user } = useAuth0();

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
      <Row xs={1} md={3} className="g-2">
        {Array.from({ length: 9 }).map((_, idx) => (
          <Col key={idx}>
            <Card>
              <Card.Img
                variant="top"
                src="https://www.brittany.com.ph/wp-content/uploads/2021/10/The-Clifton-2A-Luxury-home-in-south-africa-swimming-pool-and-fire-pit-luxury-mansion.jpg"
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
