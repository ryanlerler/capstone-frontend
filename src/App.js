import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import { useEffect, useState, createContext } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import axios from "axios";
import ScrollToTop from "react-scroll-to-top";
import UserProfile from "./pages/UserProfile";
import Listings from "./pages/Listings";
import Listing from "./pages/Listing";
import EditListingForm from "./pages/EditListingForm";
import AddListingForm from "./pages/AddListingForm";
import CustomNavbar from "./components/CustomNavbar";
import Dashboard from "./pages/Dashboard";
import ScamAlerts from "./pages/ScamAlerts";
import UserListings from "./pages/UserListings";

export const UserContext = createContext();

function FixScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to the top of the page when the route changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
function App() {
  const [listing, setListing] = useState({});
  const [loggedInUser, setLoggedInUser] = useState({});
  const { user, getAccessTokenSilently } = useAuth0();
  const value = { loggedInUser, setLoggedInUser };

  console.log(loggedInUser);

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

    if (user) {
      fetchToken();
    }
  }, [getAccessTokenSilently, user]);

  return (
    <div className="App">
      <header className="App-header">
        <UserContext.Provider value={value}>
          <FixScrollToTop />
          <ScrollToTop color="black" width="20" height="20" />

          <CustomNavbar />

          <Routes>
            <Route index element={<HomePage />} />

            <Route path="/user/update" element={<UserProfile />} />

            <Route path="/users/:userId" element={<Dashboard />} />

            <Route path="/listings" element={<Listings />} />

            <Route
              path="/listings/:listingId"
              element={<Listing listing={listing} setListing={setListing} />}
            />

            <Route path="/listings/user/:userId" element={<UserListings />} />

            <Route
              path="/listings/:listingId/update"
              element={
                <EditListingForm listing={listing} setListing={setListing} />
              }
            />

            <Route path="/rent" element={<AddListingForm />} />

            <Route path="/scam-alerts" element={<ScamAlerts />} />
          </Routes>
        </UserContext.Provider>
      </header>
    </div>
  );
}

export default App;
