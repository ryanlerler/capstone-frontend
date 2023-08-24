import { Button, Nav, Navbar, NavDropdown, NavLink } from "react-bootstrap";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../App";

export default function CustomNavbar() {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const user = useContext(UserContext);

  const handleNavLinkClick = (path) => {
    if (!isAuthenticated) {
      loginWithRedirect();
    } else {
      navigate(path);
    }
  };

  return (
    <div>
      <Navbar expand="lg" className="bg-body-tertiary" fixed="top">
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Navbar.Brand href="#home">Co-living</Navbar.Brand>
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: "100px" }}
            navbarScroll
          >
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link onClick={() => handleNavLinkClick("/listings")}>
              Listings
            </Nav.Link>
            <Nav.Link onClick={() => handleNavLinkClick("/rent")}>
              Rent
            </Nav.Link>

            {isAuthenticated ? (
              <NavDropdown
                title={
                  <div className="profile">
                    <img
                      src={
                        user.picture ||
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
                  {user.email}
                  <NavDropdown.Divider />

                  <Button
                    onClick={() => handleNavLinkClick("/users/update")}
                    variant="light"
                  >
                    Profile
                  </Button>

                  <NavDropdown.Divider />
                  <Button
                    onClick={() =>
                      logout({
                        logoutParams: {
                          returnTo: window.location.origin,
                        },
                      })
                    }
                    variant="light"
                  >
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
