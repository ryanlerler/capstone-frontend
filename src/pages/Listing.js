import axios from "axios";
import { useState, useEffect, useContext, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Button,
  Form,
  ListGroup,
  Carousel,
  Row,
  Col,
  Modal,
} from "react-bootstrap";
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
import { BiShareAlt } from "react-icons/bi";
import { RiSendPlaneFill } from "react-icons/ri";
import VoiceRecognition from "../components/VoiceRecognition";
import EmojiPicker from "emoji-picker-react";

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
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fullScreenImageSrc, setFullScreenImageSrc] = useState("");
  const [fullScreenImageIndex, setFullScreenImageIndex] = useState(0);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const value = useContext(UserContext);
  const textareaRef = useRef(null);

  const target = [listing.longitude, listing.latitude];

  /**
   * @param lnglat - coordinates of query location (required)
   * @param excludeFuture - whether to exclude future stations ({boolean}, default false)
   * @param radius - limit radius of search in meters ({numeric}, default 1000)
   */
  const nearestMRT = getNearestMrt(target, false, 750);
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
      {
        text: voiceTranscript || commentInput,
        email: value.loggedInUser.email,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setComments((prev) => [...prev, data]);
    setCommentInput("");
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
  };

  const copyListingLink = () => {
    const listingURL = window.location.href;
    navigator.clipboard.writeText(listingURL).then(() => {
      alert("Listing URL copied to clipboard!");
    });
    handleCloseShareModal();
  };

  const shareOnFacebook = () => {
    const listingURL = window.location.href;
    const facebookShareURL = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      listingURL
    )}`;
    window.open(facebookShareURL, "_blank");
    handleCloseShareModal();
  };

  const shareOnTwitter = () => {
    const listingURL = window.location.href;
    const tweetText = encodeURIComponent(
      `Check out this awesome listing: ${listing.title} ${listingURL}`
    );
    const twitterShareURL = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(twitterShareURL, "_blank");
    handleCloseShareModal();
  };

  const toggleFullScreen = (imageSrc, imageIndex) => {
    setIsFullScreen(!isFullScreen);
    setFullScreenImageSrc(imageSrc);
    setFullScreenImageIndex(imageIndex);
  };

  const handleVoiceTranscriptChange = (transcript) => {
    setVoiceTranscript(transcript);
  };

  const insertEmoji = (emojiData) => {
    const inputRef = textareaRef.current;

    if (inputRef) {
      const startPos = inputRef.selectionStart;
      const endPos = inputRef.selectionEnd;
      const inputValue = inputRef.value;
      const emoji = String.fromCodePoint(parseInt(emojiData.unified, 16));
      const updatedValue =
        inputValue.substring(0, startPos) +
        emoji +
        inputValue.substring(endPos);

      setCommentInput(updatedValue);
      inputRef.focus();
      inputRef.setSelectionRange(startPos + 2, startPos + 2);
    }
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
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

              <Carousel
                interval={null}
                className="carousel-container"
                activeIndex={fullScreenImageIndex}
                onSelect={() => {}}
              >
                {listing.files &&
                  listing.files.length > 0 &&
                  listing.files.map((file) => (
                    <Carousel.Item
                      key={file.id}
                      onClick={() => toggleFullScreen(file.url)}
                    >
                      <img
                        src={file.url}
                        alt="file"
                        className="d-block w-100"
                      />
                    </Carousel.Item>
                  ))}
              </Carousel>

              {isFullScreen && (
                <div
                  className="fullscreen-modal"
                  onClick={() => toggleFullScreen("")}
                >
                  <img
                    src={fullScreenImageSrc}
                    alt="file"
                    className="fullscreen-image"
                  />
                </div>
              )}

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
                  Postal Code:{" "}
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

              <hr />
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
              <hr />

              {value.loggedInUser.email &&
                value.loggedInUser.email === listing.user.email && (
                  <Link to={`/listings/${listingId}/update`}></Link>
                )}

              <Link to={`/listings/user/${listing.userId}`}>
                <small>
                  <img
                    src={listing.user.profilePicUrl}
                    alt="profile"
                    className="comment-profile"
                  />
                  {listing.user.name}
                </small>
              </Link>

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

      {listing.user && listing.user.contactNo !== null && !listing.rented ? (
        <div>
          Whatsapp:{" "}
          {listing.user && (
            //ToDo: CHANGE TO NETLIFY DEPLOYED LINK
            <a
              href={`https://wa.me/65${
                listing.user.contactNo
              }?text=Hello%20there,%20I'm%20interested%20in%20your%20listing%20@%20${`http://localhost:3001/listings/${listing.id}`}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {listing.user.contactNo}
            </a>
          )}
        </div>
      ) : (
        listing.user &&
        !listing.rented && <div>Email: {listing.user.email}</div>
      )}

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
              value={voiceTranscript || commentInput}
              placeholder="Enter comment"
              onChange={({ target }) =>
                setCommentInput(sanitizeInput(target.value))
              }
              required
              ref={textareaRef}
              style={{ paddingRight: "40px" }}
            />

            {showEmojiPicker && <EmojiPicker onEmojiClick={insertEmoji} />}

            <Button
              variant="transparent"
              className="position-absolute bottom-10 end-0 mb-2 me-2"
              onClick={toggleEmojiPicker}
            >
              😃
            </Button>

            <VoiceRecognition
              onTranscriptChange={handleVoiceTranscriptChange}
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="special-button">
            <RiSendPlaneFill />
          </Button>
        </Form>
      </div>

      <div className="nearby-listings">
        <h2>Nearby Listings</h2>
        {nearbyListings && nearbyListings.length > 1 ? (
          <ul>
            {nearbyListings
              .filter(
                (nearbyListing) =>
                  nearbyListing.id !== listing.id && !nearbyListing.rented
              )
              .map((nearbyListing) => {
                const distance = calculateDistance(
                  listing.latitude,
                  listing.longitude,
                  nearbyListing.latitude,
                  nearbyListing.longitude
                );

                return (
                  <li key={nearbyListing.id} className="nearby-listing-item">
                    <Link to={`/listings/${nearbyListing.id}`} target="_blank">
                      {nearbyListing.files &&
                        nearbyListing.files.length > 0 && (
                          <img
                            src={nearbyListing.files[0].url}
                            alt="file"
                            className="nearby-listing-image"
                          />
                        )}
                      <div>
                        <>
                          {nearbyListing.title} ({distance.toFixed(2)} km)
                        </>
                      </div>
                    </Link>
                  </li>
                );
              })}
          </ul>
        ) : (
          <p> No listings nearby</p>
        )}
      </div>

      <Button onClick={handleShare} variant="light">
        <BiShareAlt /> Share
      </Button>

      <Modal show={showShareModal} onHide={handleCloseShareModal}>
        <Modal.Header closeButton>
          <Modal.Title>Share This Listing</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Share this listing via:</p>
          <Button onClick={copyListingLink}>Copy Link</Button>{" "}
          <Button onClick={shareOnFacebook}>Facebook</Button>{" "}
          <Button onClick={shareOnTwitter}>Twitter</Button>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseShareModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
