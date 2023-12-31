import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { storage } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import { sanitizeInput } from "../utils/InputSanitizer";
import { UserContext } from "../App";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { RiSendPlaneFill } from "react-icons/ri";
import { GiCancel } from "react-icons/gi";

// const VIDEO_STORAGE_KEY = "videos/";
const PICTURE_STORAGE_KEY = "pictures/";

export default function AddListingForm() {
  const navigate = useNavigate();
  const [textInput, setTextInput] = useState({
    title: "",
    description: "",
    fullAddress: "",
  });
  const [numberInput, setNumberInput] = useState({
    price: "",
    postalCode: "",
  });
  const [userSelectInput, setUserSelectInput] = useState({
    pubIncluded: "Yes - All In",
    paxCount: 1,
    airCon: "Yes",
    internet: "Yes",
    furnishedCondition: "Fully Furnished",
    level: "High",
    advertisedBy: "Owner",
    leaseMonth: "3 months",
    gender: "Any",
    cookingAllowed: "Yes",
    bedroomCount: 1,
    washroomAttached: "Yes",
    lift: "Yes",
    washroomCount: 1,
    visitorAllowed: "Yes",
    petAllowed: "Yes",
  });
  const [locationOptions, setLocationOptions] = useState([]);
  const [userLocationOption, setUserLocationOption] = useState("");
  const [propertyTypeOptions, setPropertyTypeOptions] = useState([]);
  const [userPropertyTypeOption, setUserPropertyTypeOption] = useState("");
  const [roomTypeOptions, setRoomTypeOptions] = useState([]);
  const [userRoomTypeOption, setUserRoomTypeOption] = useState("");
  const [availability, setAvailability] = useState(
    new Date().toISOString().split("T")[0]
  );
  // const [videoFileInputFile, setVideoFileInputFile] = useState(null);
  // const [videoFileInputValue, setVideoFileInputValue] = useState("");
  const [photoFileInputFiles, setPhotoFileInputFiles] = useState([]);
  const [photoFileInputValues, setPhotoFileInputValues] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const value = useContext(UserContext);

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
    const callOneMapApi = async () => {
      if (numberInput.postalCode.length === 6) {
        try {
          const { data } = await axios.get(
            `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${numberInput.postalCode}&returnGeom=Y&getAddrDetails=Y&pageNum=1`
          );

          setTextInput({
            ...textInput,
            fullAddress: data.results[0]?.ADDRESS || "",
          });
          setLatitude(data.results[0]?.LATITUDE);
          setLongitude(data.results[0]?.LONGITUDE);
        } catch (error) {
          console.error("Error fetching address:", error);
        }
      }
    };

    callOneMapApi();
  }, [numberInput.postalCode]);

  const handleTextInputChange = ({ target }) => {
    const { name, value } = target;
    setTextInput({ ...textInput, [name]: sanitizeInput(value) });
  };

  const handleNumberInputChange = ({ target }) => {
    const { name, value } = target;
    setNumberInput({ ...numberInput, [name]: value });
  };

  const handleSelectInputChange = ({ target }) => {
    const { name, value } = target;
    setUserSelectInput((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    // const uniqueVideoFileName = videoFileInputFile.name + uuidv4();
    // const videoFileRef = storageRef(
    //   storage,
    //   `${VIDEO_STORAGE_KEY}${uniqueVideoFileName}`
    // );

    // await uploadBytes(videoFileRef, videoFileInputFile);

    // const videoUrl = await getDownloadURL(videoFileRef);

    let photoUrls = [];
    if (photoFileInputFiles.length > 0) {
      for (const file of photoFileInputFiles) {
        const uniquePictureFileName = file.name + uuidv4();
        const pictureFileRef = storageRef(
          storage,
          `${PICTURE_STORAGE_KEY}${uniquePictureFileName}`
        );

        await uploadBytes(pictureFileRef, file);

        const photoUrl = await getDownloadURL(pictureFileRef);
        photoUrls.push(photoUrl);
      }
    }

    const { data } = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/listings`,
      {
        title: textInput.title,
        description: textInput.description,
        fullAddress: textInput.fullAddress,
        price: numberInput.price,
        postalCode: numberInput.postalCode,
        pubIncluded: userSelectInput.pubIncluded,
        paxCount: userSelectInput.paxCount,
        airCon: userSelectInput.airCon === "Yes" ? true : false,
        internet: userSelectInput.internet === "Yes" ? true : false,
        furnishedCondition: userSelectInput.furnishedCondition,
        level: userSelectInput.level,
        advertisedBy: userSelectInput.advertisedBy,
        leaseMonth: userSelectInput.leaseMonth,
        gender: userSelectInput.gender,
        cookingAllowed: userSelectInput.cookingAllowed === "Yes" ? true : false,
        bedroomCount: userSelectInput.bedroomCount,
        washroomAttached:
          userSelectInput.washroomAttached === "Yes" ? true : false,
        lift: userSelectInput.lift === "Yes" ? true : false,
        locationId: userLocationOption.value,
        washroomCount: userSelectInput.washroomCount,
        visitorAllowed: userSelectInput.visitorAllowed === "Yes" ? true : false,
        petAllowed: userSelectInput.petAllowed === "Yes" ? true : false,
        propertyTypeId: userPropertyTypeOption.value,
        roomTypeId: userRoomTypeOption.value,
        availability,
        photoUrls,
        email: value.loggedInUser.email,
        latitude,
        longitude,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    navigate(`/listings/${data.id}`);
  };

  // const handleVideoFileChange = ({ target }) => {
  //   const { files, value } = target;
  //   setVideoFileInputFile(files[0]);
  //   setVideoFileInputValue(value);
  // };

  const handlePictureFileChange = ({ target }) => {
    const { files } = target;
    setPhotoFileInputFiles(files);
    setPhotoFileInputValues(Array.from(files).map((file) => file.name));
    const previewUrls = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );
    setPhotoPreviews(previewUrls);
  };

  const generateDescription = async (e) => {
    e.preventDefault();

    const content = {
      title: textInput.title,
      fullAddress: textInput.fullAddress,
      price: numberInput.price,
      postalCode: numberInput.postalCode,
      pubIncluded: userSelectInput.pubIncluded,
      paxCount: userSelectInput.paxCount,
      airCon: userSelectInput.airCon,
      internet: userSelectInput.internet,
      furnishedCondition: userSelectInput.furnishedCondition,
      level: userSelectInput.level,
      advertisedBy: userSelectInput.advertisedBy,
      leaseMonth: userSelectInput.leaseMonth,
      gender: userSelectInput.gender,
      cookingAllowed: userSelectInput.cookingAllowed,
      bedroomCount: userSelectInput.bedroomCount,
      washroomAttached: userSelectInput.washroomAttached,
      lift: userSelectInput.lift,
      washroomCount: userSelectInput.washroomCount,
      visitorAllowed: userSelectInput.visitorAllowed,
      petAllowed: userSelectInput.petAllowed,
      userLocationOption: userLocationOption.label,
      userPropertyTypeOption: userPropertyTypeOption.label,
      userRoomTypeOption: userRoomTypeOption.label,
      availability: availability,
    };

    const { data } = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/chatgpt`,
      {
        content: content,
      }
    );
    setTextInput({ ...textInput, description: data });
  };

  return (
    <Container>
      <Form.Label>Add A New Listing</Form.Label>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col>
            <Form.Label>
              <small>Title</small>
            </Form.Label>
            <Form.Group className="mb-3">
              <Form.Control
                name="title"
                type="text"
                placeholder="Title"
                value={textInput.title}
                onChange={handleTextInputChange}
                required
                minLength={3}
                maxLength={35}
              />
            </Form.Group>
          </Col>

          <Col>
            <Form.Label>
              <small>Price (SGD)</small>
            </Form.Label>
            <Form.Group className="mb-3">
              <Form.Control
                name="price"
                type="number"
                placeholder="Price ($)"
                value={numberInput.price}
                onChange={handleNumberInputChange}
                required
                min={1}
              />
            </Form.Group>
          </Col>

          <Col>
            <Form.Label>
              <small>PUB Included?</small>
            </Form.Label>
            <Form.Select
              name="pubIncluded"
              value={userSelectInput.pubIncluded}
              onChange={handleSelectInputChange}
              required
            >
              <option>Yes - All In</option>
              <option>Yes but capped</option>
              <option>No</option>
            </Form.Select>
          </Col>
        </Row>

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
              required
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
              required
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
              required
            />
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Label>
              <small>Postal Code</small>
            </Form.Label>
            <Form.Group className="mb-3">
              <Form.Control
                name="postalCode"
                type="number"
                placeholder="6-digit postal code"
                value={numberInput.postalCode}
                onChange={handleNumberInputChange}
                required
                pattern="[0-9]{6}"
              />
            </Form.Group>
          </Col>

          <Col>
            <Form.Label>
              <small>Address</small>
            </Form.Label>
            <Form.Group className="mb-3">
              <Form.Control
                name="fullAddress"
                type="text"
                placeholder="Address"
                value={textInput.fullAddress}
                onChange={handleTextInputChange}
                required
              />
            </Form.Group>
          </Col>

          <Col>
            <Form.Label>
              <small>Availability</small>
            </Form.Label>
            <Form.Group className="mb-3">
              <Form.Control
                name="availability"
                type="date"
                value={availability}
                onChange={({ target }) => setAvailability(target.value)}
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Label>
              <small>No. of Bedrooms</small>
            </Form.Label>
            <Form.Select
              name="bedroomCount"
              value={userSelectInput.bedroomCount}
              onChange={handleSelectInputChange}
              required
            >
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
              <option>6</option>
            </Form.Select>
          </Col>

          <Col>
            <Form.Label>
              <small>No. of Bathrooms</small>
            </Form.Label>
            <Form.Select
              name="washroomCount"
              value={userSelectInput.washroomCount}
              onChange={handleSelectInputChange}
              required
            >
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
              <option>6</option>
            </Form.Select>
          </Col>

          <Col>
            <Form.Label>
              <small>No. of Pax</small>
            </Form.Label>
            <Form.Select
              name="paxCount"
              value={userSelectInput.paxCount}
              onChange={handleSelectInputChange}
              required
            >
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
              <option>6</option>
            </Form.Select>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Label>
              <small>Air Conditioner</small>
            </Form.Label>
            <Form.Select
              name="airCon"
              value={userSelectInput.airCon}
              onChange={handleSelectInputChange}
              required
            >
              <option>Yes</option>
              <option>No</option>
            </Form.Select>
          </Col>

          <Col>
            <Form.Label>
              <small>Internet</small>
            </Form.Label>
            <Form.Select
              name="internet"
              value={userSelectInput.internet}
              onChange={handleSelectInputChange}
              required
            >
              <option>Yes</option>
              <option>No</option>
            </Form.Select>
          </Col>

          <Col>
            <Form.Label>
              <small>Lease (in Months)</small>
            </Form.Label>
            <Form.Select
              name="leaseMonth"
              value={userSelectInput.leaseMonth}
              onChange={handleSelectInputChange}
              required
            >
              <option>3 months</option>
              <option>6 months</option>
              <option>12 months</option>
              <option>18 months</option>
              <option>24 months</option>
              <option>{">"} 24 months</option>
              <option>Flexible</option>
            </Form.Select>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Label>
              <small>Gender</small>
            </Form.Label>
            <Form.Select
              name="gender"
              value={userSelectInput.gender}
              onChange={handleSelectInputChange}
              required
            >
              <option>Any</option>
              <option>Male</option>
              <option>Female</option>
            </Form.Select>
          </Col>

          <Col>
            <Form.Label>
              <small>Furnishing</small>
            </Form.Label>
            <Form.Select
              name="furnishedCondition"
              value={userSelectInput.furnishedCondition}
              onChange={handleSelectInputChange}
              required
            >
              <option>Fully Furnished</option>
              <option>Partially Furnished</option>
              <option>Unfurnished</option>
            </Form.Select>
          </Col>

          <Col>
            <Form.Label>
              <small>Level</small>
            </Form.Label>
            <Form.Select
              name="level"
              value={userSelectInput.level}
              onChange={handleSelectInputChange}
              required
            >
              <option>High</option>
              <option>Mid</option>
              <option>Low</option>
            </Form.Select>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Label>
              <small>Lift Access?</small>
            </Form.Label>
            <Form.Select
              name="lift"
              value={userSelectInput.lift}
              onChange={handleSelectInputChange}
              required
            >
              <option>Yes</option>
              <option>No</option>
            </Form.Select>
          </Col>

          <Col>
            <Form.Label>
              <small>Washroom Attached?</small>
            </Form.Label>
            <Form.Select
              name="washroomAttached"
              value={userSelectInput.washroomAttached}
              onChange={handleSelectInputChange}
              required
            >
              <option>Yes</option>
              <option>No</option>
            </Form.Select>
          </Col>

          <Col>
            <Form.Label>
              <small>Advertised By</small>
            </Form.Label>
            <Form.Select
              name="advertisedBy"
              value={userSelectInput.advertisedBy}
              onChange={handleSelectInputChange}
              required
            >
              <option>Owner</option>
              <option>Agent</option>
              <option>Tenant</option>
            </Form.Select>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Label>
              <small>Cooking Allowed?</small>
            </Form.Label>
            <Form.Select
              name="cookingAllowed"
              value={userSelectInput.cookingAllowed}
              onChange={handleSelectInputChange}
              required
            >
              <option>Yes</option>
              <option>No</option>
            </Form.Select>
          </Col>

          <Col>
            <Form.Label>
              <small>Visitor Allowed?</small>
            </Form.Label>
            <Form.Select
              name="visitorAllowed"
              value={userSelectInput.visitorAllowed}
              onChange={handleSelectInputChange}
              required
            >
              <option>Yes</option>
              <option>No</option>
            </Form.Select>
          </Col>

          <Col>
            <Form.Label>
              <small>Pet Allowed?</small>
            </Form.Label>
            <Form.Select
              name="petAllowed"
              value={userSelectInput.petAllowed}
              onChange={handleSelectInputChange}
              required
            >
              <option>Yes</option>
              <option>No</option>
            </Form.Select>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Label>
              Description{" "}
              <Button onClick={generateDescription} variant="light">
                <img
                  src="https://www.dockhunt.com/_next/image?url=https%3A%2F%2Fdockhunt-images.nyc3.cdn.digitaloceanspaces.com%2F20b5071c-73d3-44ce-9210-9d3e337a2ccd&w=256&q=75"
                  alt="chatgpt"
                  style={{ height: "5vh" }}
                />
              </Button>
            </Form.Label>
            <Form.Group className="mb-3">
              <Form.Control
                name="description"
                as="textarea"
                type="text"
                placeholder="AI-Generated or Your Own Description"
                value={textInput.description}
                onChange={handleTextInputChange}
                required
                minLength={3}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label className="fs-5">
                <small>
                  <strong>Upload Photos</strong>
                </small>
              </Form.Label>
              <Form.Control
                type="file"
                onChange={handlePictureFileChange}
                required
                accept="image/*"
                multiple
              />
            </Form.Group>
          </Col>

          {photoPreviews.map((previewUrl, index) => (
            <div key={index}>
              <img
                src={previewUrl}
                alt={`Preview ${index}`}
                style={{ maxWidth: "200px", maxHeight: "200px" }}
              />
              <p>{photoFileInputValues[index]}</p>
            </div>
          ))}
        </Row>

        <Button type="submit" className="special-button">
          <RiSendPlaneFill />
        </Button>
        <Button onClick={() => navigate(-1)} className="special-button">
          <GiCancel />
        </Button>
      </Form>
    </Container>
  );
}
