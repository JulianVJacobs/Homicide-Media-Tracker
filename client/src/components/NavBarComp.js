import React from "react";
import Home from "./Home";
import "./InputHomicide.css";
import ListHomicides from "./ListHomicides";
import InputHomicide from "./InputHomicide";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from "react-router-dom";

class NavBarComp extends React.Component {
  render() {
    return (
      <Router>
        <div>
          <Navbar expand="lg" className="custom-navbar bg-light text-light">
            <Container fluid>
              <Navbar.Brand href="#" className="fs-4">
                Homicide Tracker
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="navbarScroll" />
              <Navbar.Collapse id="navbarScroll">
                <Nav
                  className="me-auto my-2 my-lg-0"
                  style={{ maxHeight: "100px" }}
                  navbarScroll
                >
                  <Nav.Link as={Link} to={"/Home"}>
                    Home
                  </Nav.Link>
                  <Nav.Link as={Link} to={"/InputHomicide"}>
                    Add Homicides
                  </Nav.Link>
                  <Nav.Link as={Link} to={"/ListHomicides"}>
                    List Homicides
                  </Nav.Link>
                  <NavDropdown title="Link" id="navbarScrollingDropdown">
                    <NavDropdown.Item href="#action3">Action</NavDropdown.Item>
                    <NavDropdown.Item href="#action4">
                      Another action
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="#action5">
                      Something else here
                    </NavDropdown.Item>
                  </NavDropdown>
                  <Nav.Link href="#" disabled>
                    Link
                  </Nav.Link>
                </Nav>
                <Form className="d-flex">
                  <Form.Control
                    type="search"
                    placeholder="Search"
                    className="me-2"
                    aria-label="Search"
                  />
                  <Button variant="outline-success">Search</Button>
                </Form>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </div>
        <div>
          <Routes>
            <Route path="/Home" element={<Home />} />
            <Route path="/InputHomicide" element={<InputHomicide />} />
            <Route path="/ListHomicides" element={<ListHomicides />} />
          </Routes>
        </div>
      </Router>
    );
  }
}

export default NavBarComp;
