import React from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'

const Navigation = (props) => {

  let navList ;
  if (props.isLoggedIn === false) {
    navList = (
      <Nav className="ml-auto">
        <Nav.Link href="/">Login</Nav.Link>
        <Nav.Link href="/signup">Sign Up</Nav.Link>
      </Nav>
    );
  } else if (props.isLoggedIn === true) {
    navList = (
      <Nav className="ml-auto">
        <Nav.Link href="/">Dashboard</Nav.Link>
        <Nav.Link href="/alltips">All Tips</Nav.Link>
        <Nav.Link href="/charts">Charts</Nav.Link>
        <Nav.Link href="/add">Add a Tip</Nav.Link>
        <NavDropdown title={<FontAwesomeIcon style={{fontSize: "1.5rem" }} icon={faUserCircle} />} id="navbarDropdownMenuLink">
          <NavDropdown.Item href="/account">Details</NavDropdown.Item>
          <NavDropdown.Item className="text-danger" onSelect={props.onLogout}>Logout</NavDropdown.Item>
        </NavDropdown>
      </Nav>
    );
  }

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand href="/">Tip Manager</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />

      <Navbar.Collapse id="basic-navbar-nav">
        {navList}
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Navigation;
