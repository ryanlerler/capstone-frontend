import { Card, Col, Row } from "react-bootstrap";

export default function HomePage() {
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
