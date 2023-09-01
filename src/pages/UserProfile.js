import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Toast } from "react-bootstrap";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { storage } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import { useAuth0 } from "@auth0/auth0-react";
import Filter from "bad-words";
import { UserContext } from "../App";

const filter = new Filter();

export default function UserProfile() {
  const value = useContext(UserContext);
  const navigate = useNavigate();
  const [updatedProfile, setUpdatedProfile] = useState({});
  const [photoFileInputFile, setPhotoFileInputFile] = useState(null);
  const [photoFileInputValue, setPhotoFileInputValue] = useState("");
  const { getAccessTokenSilently, user } = useAuth0();
  const [showToast, setShowToast] = useState(false);
  const [isFormUpdated, setIsFormUpdated] = useState(false);

  const PROFILE_PICTURE_STORAGE_KEY = `profile-pictures/${value.loggedInUser.email}`;

  useEffect(() => {
    value.setLoggedInUser(value.loggedInUser);
    setUpdatedProfile({
      name: value.loggedInUser.name || "",
      contactNo: value.loggedInUser.contactNo || "",
    });
  }, [value]);

  useEffect(() => {
    const isNameUpdated = updatedProfile.name !== value.loggedInUser.name;
    const isPhotoUpdated = photoFileInputFile !== null;
    const isContactNoUpdated =
      updatedProfile.ContactNo !== value.loggedInUser.ContactNo;

    setIsFormUpdated(isNameUpdated || isPhotoUpdated || isContactNoUpdated);
  }, [updatedProfile, photoFileInputFile, value.loggedInUser]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!isFormUpdated) {
      return;
    }

    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: process.env.REACT_APP_AUDIENCE,
        scope: "read:current_user",
      },
    });

    let profilePicUrl = null;

    const uniquePictureFileName = photoFileInputFile.name + uuidv4();
    const pictureFileRef = storageRef(
      storage,
      `${PROFILE_PICTURE_STORAGE_KEY}/${uniquePictureFileName}`
    );

    await uploadBytes(pictureFileRef, photoFileInputFile);

    profilePicUrl = await getDownloadURL(pictureFileRef);

    const sanitizedName = filter.isProfane(updatedProfile.name)
      ? filter.clean(updatedProfile.name)
      : updatedProfile.name;

    const { data } = await axios.put(
      `${process.env.REACT_APP_BACKEND_URL}/users`,
      {
        name: sanitizedName || value.loggedInUser.name,
        profilePicUrl: profilePicUrl || value.loggedInUser.profilePicUrl,
        contactNo: updatedProfile.contactNo || null,
        email: user.email,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    value.setLoggedInUser((prev) => ({
      ...prev,
      name: data.name || value.loggedInUser.name,
      profilePicUrl: data.profilePicUrl || value.loggedInUser.profilePicUrl,
      contactNo: data.contactNo || value.loggedInUser.contactNo,
    }));

    setShowToast(true);
  };

  const handlePictureFileChange = ({ target }) => {
    const { files, value } = target;
    setPhotoFileInputFile(files[0]);
    setPhotoFileInputValue(value);
  };

  return (
    <div>
      <div>
        <Form onSubmit={handleUpdate}>
          <Form.Label className="fs-5">
            <strong>Account:</strong> {user && user.email}
          </Form.Label>
          <br />
          <Form.Label className="fs-5">Display Name</Form.Label>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              value={updatedProfile.name || ""}
              onChange={({ target }) =>
                setUpdatedProfile((prev) => ({
                  ...prev,
                  name: target.value,
                }))
              }
              required
              placeholder="Enter your display name"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fs-5">Profile Picture</Form.Label>
            <Form.Control
              type="file"
              value={photoFileInputValue}
              onChange={handlePictureFileChange}
              accept="image/*"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fs-5">Contact Number</Form.Label>
            <Form.Control
              type="text"
              value={updatedProfile.contactNo || ""}
              onChange={({ target }) =>
                setUpdatedProfile((prev) => ({
                  ...prev,
                  contactNo: target.value,
                }))
              }
              required
              placeholder="Enter a valid 8-digit mobile no"
              pattern="[0-9]{8}"
            />
          </Form.Group>

          <Toast
            show={showToast}
            onClose={() => setShowToast(false)}
            delay={3000}
            autohide
          >
            <Toast.Body>Profile updated successfully!</Toast.Body>
          </Toast>

          <Button type="submit" className="special-button">
            Update
          </Button>
          <Button onClick={() => navigate(-1)} className="special-button">
            Cancel
          </Button>
        </Form>
      </div>
    </div>
  );
}
