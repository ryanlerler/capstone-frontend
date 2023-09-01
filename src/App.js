import { Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import { useEffect, useState, createContext } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import axios from "axios";
import ScrollToTop from "react-scroll-to-top";
import UserProfile from "./pages/UserProfile";
import Listings from "./pages/Listings";
import Listing from "./pages/Listing";
import ListingUpdateForm from "./pages/ListingUpdateForm";
import AddPropertyForm from "./pages/AddPropertyForm";
import Conversation from "./pages/Conversation";
import CustomNavbar from "./components/CustomNavbar";
import Dashboard from "./pages/Dashboard";

export const UserContext = createContext();

function App() {
  const [listing, setListing] = useState({});
  const [loggedInUser, setLoggedInUser] = useState({});
  const { user, getAccessTokenSilently } = useAuth0();
  const value = { loggedInUser, setLoggedInUser };

  console.log(user);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/users/${user.email}`
      );
      console.log(data);
      if (data) {
        setLoggedInUser(data);
      }
    };

    if (user) {
      fetchUser();
    }
  }, [user]);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.REACT_APP_AUDIENCE,
          scope: "read:current_user",
        },
      });

      localStorage.setItem("token", token);
    };

    fetchToken();
  }, [getAccessTokenSilently]);

  return (
    <div className="App">
      <header className="App-header">
        <UserContext.Provider value={value}>
          <ScrollToTop color="black" width="20" height="20" />

          <CustomNavbar />

          <Routes>
            <Route index element={<HomePage />} />

            <Route path="/user/update" element={<UserProfile />} />

            <Route path="/user/dashboard" element={<Dashboard />} />

            <Route path="/listings" element={<Listings />} />

            <Route
              path="/listings/:listingId"
              element={<Listing listing={listing} setListing={setListing} />}
            />

            <Route
              path="/listings/:listingId/update"
              element={
                <ListingUpdateForm listing={listing} setListing={setListing} />
              }
            />

            <Route path="/rent" element={<AddPropertyForm />} />

            <Route path="/conversation" element={<Conversation />} />
          </Routes>
        </UserContext.Provider>
      </header>
    </div>
  );
}

export default App;
