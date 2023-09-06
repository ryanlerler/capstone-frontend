import { Button, Nav, Navbar, NavDropdown, NavLink } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../App";
import "../css/CustomNavbar.css";
import { TfiAlert } from "react-icons/tfi";
import { AiTwotoneHome } from "react-icons/ai";
import { IoIosAddCircle } from "react-icons/io";
import { IoSearchCircleSharp } from "react-icons/io5";

export default function CustomNavbar() {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const value = useContext(UserContext);

  const handleNavLinkClick = (path) => {
    if (!isAuthenticated) {
      loginWithRedirect();
    } else {
      navigate(path);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  return (
    <div>
      <Navbar expand="lg" className="bg-body-tertiary" fixed="top">
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Navbar.Brand href="/">Co-living</Navbar.Brand>
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: "100px" }}
            navbarScroll
          >
            <Nav.Link href="/">
              <AiTwotoneHome />
            </Nav.Link>
            <Nav.Link onClick={() => handleNavLinkClick("/listings")}>
              <IoSearchCircleSharp />
            </Nav.Link>
            <Nav.Link onClick={() => handleNavLinkClick("/rent")}>
              <IoIosAddCircle />
            </Nav.Link>
            <Nav.Link onClick={() => handleNavLinkClick("/scam-alerts")}>
              <TfiAlert />
            </Nav.Link>

            {isAuthenticated ? (
              <NavDropdown
                title={
                  <div className="profile">
                    <img
                      src={
                        value.loggedInUser.profilePicUrl ||
                        "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png"
                      }
                      alt="profile"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                }
                id="navbarScrollingDropdown"
              >
                <NavDropdown.Item>
                  <Button
                    onClick={() => handleNavLinkClick("/user/dashboard")}
                    variant="light"
                  >
                    Dashboard
                  </Button>
                  <NavDropdown.Divider />
                  <Button
                    onClick={() => handleNavLinkClick("/user/update")}
                    variant="light"
                  >
                    Update Profile
                  </Button>
                  <NavDropdown.Divider />
                  <Button onClick={handleLogout} variant="light">
                    Log Out
                  </Button>
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <NavLink onClick={() => loginWithRedirect()}>Log In</NavLink>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}
