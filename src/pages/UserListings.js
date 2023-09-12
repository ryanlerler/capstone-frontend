import axios from "axios";
import { useEffect, useState } from "react";
import { Card, Row, Col } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { MdBed, MdBathtub, MdPeopleAlt } from "react-icons/md";
import { formatRelative, subDays } from "date-fns";

export default function UserListings() {
  const [userListings, setUserListings] = useState([]);
  const { userId } = useParams();

  useEffect(() => {
    const fetchPostedListings = async () => {
      if (userId) {
        const { data } = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/listings/users/${userId}`
        );
        console.log(data);
        setUserListings(data);
      }
    };

    fetchPostedListings();
  }, [userId]);

  return (
    <div>
      {userListings[0] && userListings[0].user.name} 's Listings
      {userListings &&
        userListings.length > 0 &&
        userListings.map((listing) => (
          <Col key={listing.id}>
            <Card className="card">
              <Link to={`/listings/${listing.id}`}>
                <div className="files-container">
                  {listing.files && listing.files.length > 0 && (
                    <Card.Img
                      src={listing.files[0].url}
                      alt="file"
                      className="files"
                    />
                  )}
                </div>
              </Link>

              <Card.Body>
                <Card.Title className="card-title">
                  <strong>{listing.location.name}</strong>
                </Card.Title>
                <Card.Footer>
                  <small>
                    {listing.propertyType.type} - {listing.roomType.type}
                    <br />${listing.price}/month
                  </small>
                </Card.Footer>

                <Card.Footer>
                  <Row>
                    <Col>
                      <MdBed />{" "}
                      <small className="text-muted">
                        {listing.bedroomCount}
                      </small>
                    </Col>
                    <Col>
                      <MdBathtub />{" "}
                      <small className="text-muted">
                        {listing.washroomCount}
                      </small>
                    </Col>
                    <Col>
                      <MdPeopleAlt />{" "}
                      <small className="text-muted">{listing.paxCount}</small>
                    </Col>
                  </Row>
                </Card.Footer>

                <Card.Footer>
                  <small className="text-muted">
                    {formatRelative(
                      subDays(new Date(listing.createdAt), 0),
                      new Date()
                    )}
                  </small>
                </Card.Footer>
              </Card.Body>
            </Card>
          </Col>
        ))}
    </div>
  );
}
