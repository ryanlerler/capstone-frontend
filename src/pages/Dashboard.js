import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Tab, Tabs, Card, Row, Col, Button } from "react-bootstrap";
import { UserContext } from "../App";
import { Link } from "react-router-dom";
import { MdBed, MdBathtub, MdPeopleAlt } from "react-icons/md";
import { formatRelative, subDays } from "date-fns";
import { TiEdit } from "react-icons/ti";

export default function Dashboard() {
  const [userListings, setUserListings] = useState([]);
  const [likedListings, setLikedListings] = useState([]);
  const value = useContext(UserContext);

  console.log(likedListings);

  useEffect(() => {
    const fetchLikedListings = async () => {
      if (value.loggedInUser.id) {
        const { data } = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/likes/${value.loggedInUser.id}`
        );
        console.log(data);
        setLikedListings(data);
      }
    };

    fetchLikedListings();
  }, [value.loggedInUser.id]);

  useEffect(() => {
    const fetchPostedListings = async () => {
      if (value.loggedInUser.id) {
        const { data } = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/listings/users/${value.loggedInUser.id}`
        );
        console.log(data);
        setUserListings(data);
      }
    };

    fetchPostedListings();
  }, [value.loggedInUser.id]);

  const handleRented = async (listingId) => {
    const token = localStorage.getItem("token");

    const { data } = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/listings/${listingId}/rented`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (data) {
      alert("Marked as 'Rented'! Your contact will be hidden from the listing.");
    } else {
      alert("Marked as 'Available'");
    }
  };

  return (
    <div>
      Dashboard
      <Tabs
        defaultActiveKey="listing"
        id="uncontrolled-tab-example"
        className="mb-3"
      >
        <Tab eventKey="listing" title="Your Listings">
          {userListings &&
            userListings.length > 0 &&
            userListings.map((listing) => (
              <Col key={listing.id}>
                <Card className="card">
                  <Link to={`/listings/${listing.id}`}>
                    <div className="files-container">
                      {listing.files && listing.files.length > 0 && (
                        <Card.Img
                          src={listing.files[listing.files.length - 1].url}
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
                          <small className="text-muted">
                            {listing.paxCount}
                          </small>
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

                    <Link to={`/listings/${listing.id}/update`}>
                      <TiEdit />
                    </Link>
                  </Card.Body>

                  <Button
                    variant="danger"
                    onClick={() => handleRented(listing.id)}
                  >
                    {listing.rented ? "Mark as Available" : "Mark as Rented"}
                  </Button>
                </Card>
              </Col>
            ))}
        </Tab>

        <Tab eventKey="like" title="Your Likes">
          {likedListings &&
            likedListings.length > 0 &&
            likedListings.map((listing) => (
              <Col key={listing.listing.id}>
                <Card className="card">
                  <Link to={`/listings/${listing.listing.id}`}>
                    <div className="files-container">
                      {listing.listing.rented ? (
                        <img
                          src="https://www.grekodom.com/Images/GrDom/rented-com.jpg"
                          alt="file"
                          className="files"
                        />
                      ) : (
                        listing.listing.files &&
                        listing.listing.files.length > 0 && (
                          <Card.Img
                            src={listing.listing.files[0].url}
                            alt="file"
                            className="files"
                          />
                        )
                      )}
                    </div>
                  </Link>

                  <Card.Body>
                    <Card.Title className="card-title">
                      <strong>{listing.listing.location.name}</strong>
                    </Card.Title>
                    <Card.Footer>
                      <small>
                        {listing.listing.propertyType.type} -{" "}
                        {listing.listing.roomType.type}
                        <br />${listing.listing.price}/month
                      </small>
                    </Card.Footer>

                    <Card.Footer>
                      <Row>
                        <Col>
                          <MdBed />{" "}
                          <small className="text-muted">
                            {listing.listing.bedroomCount}
                          </small>
                        </Col>
                        <Col>
                          <MdBathtub />{" "}
                          <small className="text-muted">
                            {listing.listing.washroomCount}
                          </small>
                        </Col>
                        <Col>
                          <MdPeopleAlt />{" "}
                          <small className="text-muted">
                            {listing.listing.paxCount}
                          </small>
                        </Col>
                      </Row>
                    </Card.Footer>

                    <Card.Footer>
                      <small className="text-muted">
                        {formatRelative(
                          subDays(new Date(listing.listing.createdAt), 0),
                          new Date()
                        )}
                      </small>
                    </Card.Footer>
                  </Card.Body>
                </Card>
              </Col>
            ))}
        </Tab>
      </Tabs>
    </div>
  );
}
