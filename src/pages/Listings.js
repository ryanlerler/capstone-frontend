import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Row,
  Col,
  Container,
  Pagination,
  Form,
} from "react-bootstrap";
import "../css/Listings.css";
import { MdBed, MdBathtub, MdPeopleAlt } from "react-icons/md";
import { formatRelative, subDays } from "date-fns";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { HiMiniMapPin } from "react-icons/hi2";

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [locationOptions, setLocationOptions] = useState([]);
  const [userLocationOption, setUserLocationOption] = useState("");
  const [propertyTypeOptions, setPropertyTypeOptions] = useState([]);
  const [userPropertyTypeOption, setUserPropertyTypeOption] = useState("");
  const [roomTypeOptions, setRoomTypeOptions] = useState([]);
  const [userRoomTypeOption, setUserRoomTypeOption] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    const fetchLocations = async () => {
      const { data } = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/locations`
      );
      setLocationOptions(
        data.map((option) => ({ value: option.id, label: option.name }))
      );
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchPropertyTypes = async () => {
      const { data } = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/property-type`
      );
      setPropertyTypeOptions(
        data.map((option) => ({ value: option.id, label: option.type }))
      );
    };

    fetchPropertyTypes();
  }, []);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      const { data } = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/room-type`
      );
      setRoomTypeOptions(
        data.map((option) => ({ value: option.id, label: option.type }))
      );
    };

    fetchRoomTypes();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/listings`
      );
      setListings(data);
    };

    fetchData();
  }, []);

  const applyFilters = async (e) => {
    console.log("filtered");

    e.preventDefault();
    let apiUrl = `${process.env.REACT_APP_BACKEND_URL}/listings/filter`;

    const queryParams = {};

    if (userLocationOption) {
      queryParams.locationId = userLocationOption.value;
    }

    if (userPropertyTypeOption) {
      queryParams.propertyTypeId = userPropertyTypeOption.value;
    }

    if (userRoomTypeOption) {
      queryParams.roomTypeId = userRoomTypeOption.value;
    }

    if (minPrice) {
      queryParams.minPrice = minPrice;
    }

    if (maxPrice) {
      queryParams.maxPrice = maxPrice;
    }

    const { data } = await axios.get(apiUrl, { params: queryParams });
    setListings(data);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(listings.length / itemsPerPage);
  const visiblePages = 5;

  const getPageNumbers = () => {
    const pageNumbers = [];

    if (totalPages > visiblePages) {
      const middlePage = Math.floor(visiblePages / 2);
      const startPage = Math.max(currentPage - middlePage, 1);
      const endPage = Math.min(startPage + visiblePages - 1, totalPages);

      if (startPage > 1) {
        pageNumbers.push("ellipsis-start");
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages) {
        pageNumbers.push("ellipsis-end");
      }
    } else {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

  const clearFilters = async () => {
    setUserLocationOption("");
    setUserPropertyTypeOption("");
    setUserRoomTypeOption("");
    setMinPrice("");
    setMaxPrice("");

    const { data } = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/listings`
    );
    setListings(data);
  };

  return (
    <div>
      <Container>
        <Form onSubmit={applyFilters}>
          <Row>
            <Col>
              <Form.Label>
                <small>District</small>
              </Form.Label>
              <Select
                components={makeAnimated()}
                options={locationOptions}
                value={userLocationOption}
                onChange={(selectedOption) =>
                  setUserLocationOption(selectedOption)
                }
                styles={{
                  option: (defaultStyles) => ({
                    ...defaultStyles,
                    color: "black",
                  }),
                }}
                isClearable
              />
            </Col>

            <Col>
              <Form.Label>
                <small>Property Type</small>
              </Form.Label>
              <Select
                components={makeAnimated()}
                options={propertyTypeOptions}
                value={userPropertyTypeOption}
                onChange={(selectedOption) =>
                  setUserPropertyTypeOption(selectedOption)
                }
                styles={{
                  option: (defaultStyles) => ({
                    ...defaultStyles,
                    color: "black",
                  }),
                }}
                isClearable
              />
            </Col>

            <Col>
              <Form.Label>
                <small>Room Type</small>
              </Form.Label>
              <Select
                components={makeAnimated()}
                options={roomTypeOptions}
                value={userRoomTypeOption}
                onChange={(selectedOption) =>
                  setUserRoomTypeOption(selectedOption)
                }
                styles={{
                  option: (defaultStyles) => ({
                    ...defaultStyles,
                    color: "black",
                  }),
                }}
                isClearable
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group controlId="minPrice">
                <Form.Label>Min Price</Form.Label>
                <Form.Control
                  type="number"
                  onChange={({ target }) => setMinPrice(target.value)}
                  value={minPrice}
                  min={1}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="maxPrice">
                <Form.Label>Max Price</Form.Label>
                <Form.Control
                  type="number"
                  onChange={({ target }) => setMaxPrice(target.value)}
                  value={maxPrice}
                  min={minPrice}
                />
              </Form.Group>
            </Col>
          </Row>
          <Button type="submit" className="special-button">
            Apply Filter(s)
          </Button>
          <Button onClick={clearFilters} className="special-button">
            Clear Filters
          </Button>
        </Form>
      </Container>

      <Row xs={1} md={3} className="g-4">
        {listings
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((listing) => (
            <Col key={listing.id}>
              <Card className="card">
                <Link to={`/listings/${listing.id}`}>
                  <div className="files-container">
                    {listing.rented ? (
                      <img
                        src="https://www.grekodom.com/Images/GrDom/rented-com.jpg"
                        alt="file"
                        className="files"
                      />
                    ) : (
                      listing.files &&
                      listing.files.length > 0 && (
                        <Card.Img
                          src={listing.files[0].url}
                          alt="file"
                          className="files"
                        />
                      )
                    )}
                  </div>
                </Link>
                <Card.Body>
                  <Card.Title className="card-title">
                    <strong>{listing.location.name}</strong>
                    <br />
                    <HiMiniMapPin />{" "}
                    <Link
                      to={`https://www.google.com/maps/dir//Singapore+${listing.postalCode}`}
                      target="_blank"
                    >
                      {listing.postalCode}
                    </Link>{" "}
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
      </Row>

      <div className="pagination-container">
        <Pagination>
          <Pagination.First
            onClick={() => paginate(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {getPageNumbers().map((pageNumber, index) => (
            <div key={index}>
              {pageNumber === "ellipsis-start" && (
                <Pagination.Ellipsis disabled />
              )}
              {pageNumber === "ellipsis-end" && (
                <Pagination.Ellipsis disabled />
              )}
              {typeof pageNumber === "number" && (
                <Pagination.Item
                  key={pageNumber}
                  active={pageNumber === currentPage}
                  onClick={() => paginate(pageNumber)}
                >
                  {pageNumber}
                </Pagination.Item>
              )}
            </div>
          ))}
          <Pagination.Next
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => paginate(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>
    </div>
  );
}
