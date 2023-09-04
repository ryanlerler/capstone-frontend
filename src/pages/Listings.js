import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { Button, Card, Row, Col, Container, Pagination } from "react-bootstrap";
import "../css/Listings.css";
import { MdBed, MdBathtub, MdPeopleAlt } from "react-icons/md";
import { formatRelative, subDays } from "date-fns";

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [locations, setLocations] = useState([]);
  const [activeLocation, setActiveLocation] = useState(locations[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const sort = searchParams.get("sort");

  useEffect(() => {
    const fetchLocations = async () => {
      const { data } = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/locations`
      );
      setLocations(
        data.map((option) => ({ value: option.id, label: option.name }))
      );
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/listings`,
        {
          params: { sort: sort },
        }
      );
      setListings(data);
    };

    fetchData();
  }, [sort]);

  const handleLocationClick = async (location, locationId) => {
    setActiveLocation(location);
    setSearchParams({ locationId: locationId });

    const { data } = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/listings/locations/${locationId}`,
      { params: { locationId: locationId } }
    );
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

  return (
    <div>
      {/* <Button
        onClick={() => setSearchParams({ sort: "asc" })}
        className="special-button"
      >
        Older
      </Button>
      <Button
        onClick={() => setSearchParams({ sort: "desc" })}
        className="special-button"
      >
        Recent
      </Button>
      <br />
      <br />

      <Container>
        <div className="location-container">
          {locations.map((location, index) => (
            <div
              key={index}
              className={`location ${
                activeLocation === location ? "active" : ""
              }`}
              onClick={() => handleLocationClick(location, index + 1)}
            >
              {location.label}
            </div>
          ))}
        </div>
        <div className="footer-container"></div>
      </Container> */}

      <Row xs={1} md={3} className="g-4">
        {listings
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((listing) => (
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
