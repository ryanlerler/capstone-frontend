import axios from "axios";
import { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Form, ListGroup, Carousel, Row, Col } from "react-bootstrap";
import EditCommentForm from "../components/EditCommentForm";
import { formatDistance, formatRelative, subDays } from "date-fns";
import { sanitizeInput } from "../utils/InputSanitizer";
import { UserContext } from "../App";
import "../css/Listing.css";
import ReadMore from "../components/ReadMore";
import getNearestMrt from "nearest-mrt";
import GoogleMaps from "../components/GoogleMaps";
import { BiSolidTrain } from "react-icons/bi";
import { MdBed, MdBathtub, MdPeopleAlt, MdWifiPassword } from "react-icons/md";
import { TbAirConditioning } from "react-icons/tb";
import { FaElevator } from "react-icons/fa6";

export default function Listing({ listing, setListing }) {
  const { listingId } = useParams();
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [nearbyListings, setNearbyListings] = useState([]);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [placePhotos, setPlacePhotos] = useState({});
  const [selectedPlace, setSelectedPlace] = useState(null);
  const value = useContext(UserContext);

  const target = [listing.longitude, listing.latitude];

  /**
   * @param lnglat - coordinates of query location (required)
   * @param excludeFuture - whether to exclude future stations ({boolean}, default false)
   * @param radius - limit radius of search in meters ({numeric}, default 1000)
   */
  const nearestMRT = getNearestMrt(target, false, 1000);
  console.log(nearestMRT);

  useEffect(() => {
    const fetchData = async () => {
      const [listingResponse, commentsResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/listings/${listingId}`),
        axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/listings/${listingId}/comments`
        ),
      ]);

      setListing(listingResponse.data);
      setComments(commentsResponse.data);
    };

    fetchData();
  }, [listingId, setListing]);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (value.loggedInUser && value.loggedInUser.email) {
        const { data } = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/listings/${listingId}/likeStatus`,
          {
            params: {
              email: value.loggedInUser.email,
            },
          }
        );
        if (data) {
          setIsLiked(data.liked);
        }
      }
    };

    fetchLikeStatus();
  }, [listingId, value.loggedInUser]);

  useEffect(() => {
    const fetchLikeCount = async () => {
      const { data } = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/listings/${listingId}/likes`
      );
      if (data) {
        setLikeCount(data);
      }
    };

    fetchLikeCount();
  }, [listingId]);

  useEffect(() => {
    // Fetch the current listing's coordinates
    const currentListingLatitude = listing.latitude;
    const currentListingLongitude = listing.longitude;

    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/listings`)
      .then((response) => {
        const allListings = response.data;

        // Filter nearby listings
        const nearby = allListings.filter((otherListing) => {
          const otherListingLatitude = otherListing.latitude;
          const otherListingLongitude = otherListing.longitude;

          // Calculate distance using the calculateDistance function
          const distance = calculateDistance(
            currentListingLatitude,
            currentListingLongitude,
            otherListingLatitude,
            otherListingLongitude
          );

          // Filter listings within a certain radius (e.g., 1 kilometer)
          return distance <= 1;
        });

        setNearbyListings(nearby);
      });
  }, [listing]);

  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/places`,
          {
            params: {
              latitude: listing.latitude,
              longitude: listing.longitude,
            },
          }
        );

        // Calculate the distance for each amenity
        const amenitiesWithDistance = response.data.map((amenity) => {
          const amenityLocation = amenity.geometry.location;
          const distance = calculateDistance(
            listing.latitude,
            listing.longitude,
            amenityLocation.lat,
            amenityLocation.lng
          );
          return { ...amenity, distance };
        });

        setNearbyPlaces(amenitiesWithDistance);

        // Fetch photos for each nearby amenity
        const photoRequests = amenitiesWithDistance.map((amenity) => {
          return axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/places/photos`,
            {
              params: {
                placeId: amenity.place_id,
              },
            }
          );
        });

        const photoResponses = await Promise.all(photoRequests);
        const photosData = photoResponses.map((response) => response.data);

        const placePhotosData = {};
        photosData.forEach((photos, index) => {
          placePhotosData[amenitiesWithDistance[index].place_id] = photos;
        });

        setPlacePhotos(placePhotosData);
      } catch (error) {
        console.error("Error fetching nearby places:", error);
      }
    };

    fetchNearbyPlaces();
  }, [listing]);

  const handleLike = async () => {
    const token = localStorage.getItem("token");

    await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/listings/${listingId}/likes`,
      { email: value.loggedInUser.email },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setIsLiked(!isLiked);

    const updatedLikeCount = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/listings/${listingId}/likes`
    );
    if (updatedLikeCount) {
      setLikeCount(updatedLikeCount.data);
    }
  };

  // Function to calculate distance using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const radlat1 = (Math.PI * lat1) / 180;
    const radlat2 = (Math.PI * lat2) / 180;
    const theta = lon1 - lon2;
    const radtheta = (Math.PI * theta) / 180;
    let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515 * 1.609344; // Convert to kilometers
    return dist;
  };

  const addComment = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const { data } = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/listings/${listingId}/comments`,
      { text: commentInput, email: value.loggedInUser.email },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setComments((prev) => [...prev, data]);
    setCommentInput("");
  };

  return (
    <div className="listing-container">
      <div className="top-section">
        <div className="video-details ">
          {listing && listing.user && (
            <div>
              {/* {listing.videoUrl && listing.photoUrl && (
                <Carousel interval={null}>
                  <Carousel.Item>
                    <video
                      autoPlay
                      controls
                      key={listing.videoUrl}
                      className="video"
                    >
                      <source src={listing.videoUrl} />
                    </video>
                  </Carousel.Item>
                  <Carousel.Item>
                    <img
                      src={listing.photoUrl}
                      alt="additional content"
                      className="content-pic"
                    />
                  </Carousel.Item>
                </Carousel>
              )} */}

              <Carousel interval={null}>
                {listing.files &&
                  listing.files.length > 0 &&
                  listing.files.map((file) => (
                    <Carousel.Item key={file.id}>
                      <img src={file.url} alt="file" className="listing-pic" />
                    </Carousel.Item>
                  ))}
              </Carousel>

              <Row>
                <Col>
                  <p>
                    <strong>{listing.title}</strong>
                  </p>
                </Col>

                <Col>
                  <Button onClick={handleLike} variant="light">
                    <div className="hearts">
                      {isLiked ? (
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Beating_Heart.gif"
                          alt="liked"
                          className="liked"
                        />
                      ) : (
                        <img
                          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQP7BtQGRHgjeqk3ubWK0IbBBNqXd5mdpmc1w&usqp=CAU"
                          alt="unliked"
                          className="unliked"
                        />
                      )}
                    </div>
                    <span>{likeCount}</span>
                  </Button>
                </Col>
              </Row>

              <Row>
                <Col>${listing.price}/month</Col>
                <Col>PUB Included: {listing.pubIncluded}</Col>
              </Row>

              <Row>
                <Col>{listing.location.name}</Col>
                <Col>
                  Postal Code:
                  <Link
                    to={`https://www.google.com/maps/dir//Singapore+${listing.postalCode}`}
                    target="_blank"
                  >
                    {listing.postalCode}
                  </Link>
                </Col>
              </Row>

              <Row>
                <Col>{listing.fullAddress}</Col>
                <Col>{listing.propertyType.type}</Col>
              </Row>

              <Row>
                <Col>
                  {nearestMRT.result && nearestMRT.result.length > 0 && (
                    <div>
                      Nearest <BiSolidTrain />:{" "}
                      {nearestMRT.result.map((data) => [
                        data.station.name,
                        "(",
                        data.distance,
                        "m) ",
                      ])}
                    </div>
                  )}
                </Col>
                <Col>{listing.roomType.type}</Col>
              </Row>

              <hr />
              <Row>
                <Col>Availability: {listing.availability.slice(0, 10)}</Col>
                <Col>
                  <MdBed /> {listing.bedroomCount} <MdBathtub />{" "}
                  {listing.washroomCount} <MdPeopleAlt /> {listing.paxCount}{" "}
                </Col>
              </Row>

              <Row>
                <Col>
                  {listing.airCon === true ? "Air-Conditioned" : "No Air-Con"}{" "}
                  <TbAirConditioning />
                  {"| "}
                  {listing.internet === true ? "WIFI" : "No WIFI"}{" "}
                  <MdWifiPassword />
                  {"| "}
                  {listing.washroomAttached === true
                    ? "Attached"
                    : "Common"}{" "}
                  <MdBathtub /> {"| "}
                  {listing.lift === true
                    ? "Lift"
                    : "Walk-up"} <FaElevator />{" "}
                </Col>
                <Col>{listing.leaseMonth}</Col>
              </Row>

              <Row>
                <Col>Gender: {listing.gender}</Col>
                <Col>{listing.furnishedCondition}</Col>
              </Row>

              <Row>
                <Col>Level: {listing.level}</Col>
                <Col>Advertised By: {listing.advertisedBy}</Col>
              </Row>

              <Row>
                <Col>
                  Cooking Allowed:{" "}
                  {listing.cookingAllowed === true ? "Yes" : "No"}
                </Col>
                <Col>
                  Visitor Allowed:{" "}
                  {listing.visitorAllowed === true ? "Yes" : "No"}
                </Col>
                <Col>
                  Pet Allowed: {listing.petAllowed === true ? "Yes" : "No"}
                </Col>
              </Row>

              {value.loggedInUser.email &&
                value.loggedInUser.email === listing.user.email && (
                  <Link to={`/listings/${listingId}/update`}></Link>
                )}
              <br />

              <small>
                <img
                  src={listing.user.profilePicUrl}
                  alt="profile"
                  className="comment-profile"
                />
                {listing.user.name}
              </small>

              <br />
              <small>
                {formatRelative(
                  subDays(new Date(listing.createdAt), 0),
                  new Date()
                )}
              </small>

              <br />

              <ReadMore
                text={listing.description}
                maxLength={100}
                className="description"
              />
            </div>
          )}
        </div>
      </div>
      <div>
        Whatsapp:{" "}
        {listing.user && (
          <Link
            to={`https://wa.me/65${listing.user.contactNo}`}
            target="_blank"
          >
            {listing.user.contactNo}
          </Link>
        )}
      </div>

      <div>
        <GoogleMaps
          latitude={listing.latitude}
          longitude={listing.longitude}
          nearbyPlaces={nearbyPlaces}
          selectedPlace={selectedPlace}
          setSelectedPlace={setSelectedPlace}
        />
      </div>

      <div>
        <h2>Nearby Amenities</h2>
        {selectedPlace ? (
          <div>
            {selectedPlace.name} - {selectedPlace.vicinity} (Distance:{" "}
            {selectedPlace.distance.toFixed(2)} km)
            <br />
            {placePhotos[selectedPlace.place_id] && (
              <div>
                {placePhotos[selectedPlace.place_id].map((photoUrl, index) => (
                  <img
                    key={index}
                    src={photoUrl}
                    alt={`Amenity ${index + 1}`}
                    className="place-photo"
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <p>Click on a marker above for more details.</p>
        )}
      </div>

      <div className="comments-section">
        <hr />
        <ListGroup>
          {comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id}>
                <ListGroup.Item>
                  {comment.user && (
                    <div className="comment">
                      {comment.user.profilePicUrl && (
                        <img
                          src={comment.user.profilePicUrl}
                          alt="profile"
                          className="comment-profile"
                          referrerPolicy="no-referrer"
                        />
                      )}

                      <small className="comment-name">
                        {comment.user.name ||
                          (value.loggedInUser && value.loggedInUser.name)}{" "}
                        -{" "}
                        {formatDistance(
                          subDays(new Date(comment.createdAt), 0),
                          new Date(),
                          {
                            addSuffix: true,
                          }
                        )}
                      </small>
                    </div>
                  )}

                  <div>
                    <ReadMore text={comment.text} maxLength={100} />
                  </div>

                  {value.loggedInUser &&
                    value.loggedInUser.email &&
                    comment.user &&
                    value.loggedInUser.email === comment.user?.email && (
                      <EditCommentForm
                        comment={comment}
                        comments={comments}
                        setComments={setComments}
                      />
                    )}
                </ListGroup.Item>
              </div>
            ))
          ) : (
            <p>Be the first to comment</p>
          )}
        </ListGroup>
        <hr />

        <Form onSubmit={addComment}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Add a comment</Form.Label>
            <br />
            <Form.Control
              as="textarea"
              type="text"
              value={commentInput}
              placeholder="Enter comment"
              onChange={({ target }) =>
                setCommentInput(sanitizeInput(target.value))
              }
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="special-button">
            Submit
          </Button>
        </Form>
      </div>

      <br />
      <div>
        <h2>Nearby Listings</h2>
        {nearbyListings && nearbyListings.length > 1 ? (
          <ul>
            {nearbyListings
              .filter((nearbyListing) => nearbyListing.id !== listing.id)
              .map((nearbyListing) => {
                const distance = calculateDistance(
                  listing.latitude,
                  listing.longitude,
                  nearbyListing.latitude,
                  nearbyListing.longitude
                );

                return (
                  <li key={nearbyListing.id}>
                    <Link to={`/listings/${nearbyListing.id}`} target="_blank">
                      {nearbyListing.title} ({distance.toFixed(2)} km)
                    </Link>
                  </li>
                );
              })}
          </ul>
        ) : (
          <p> No listings nearby</p>
        )}
      </div>
    </div>
  );
}
