import React from 'react';
import { Link } from "react-router-dom";

const Navbar = props => {

  let navList ;
  if (props.isLoggedIn === false) {
    navList = (
      <ul className="navbar-nav mr-auto">
        <li className="navbar-item">
          <Link to="/" className="nav-link">Login</Link>
        </li>
        <li className="navbar-item">
          <Link to="/signup" className="nav-link">Sign Up</Link>
        </li>
      </ul>
    );
  } else if (props.isLoggedIn === true) {
    navList = (
      <ul className="navbar-nav mr-auto">
        <li className="navbar-item">
          <Link to="/" className="nav-link">Dashboard</Link>
        </li>
        <li className="navbar-item">
          <button onClick={props.onLogout}>Logout</button>
        </li>
      </ul>
    );
  }

  return (

    <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
      <Link to="/" className="navbar-brand">Tip Manager</Link>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        {navList}
      </div>
    </nav>
  );
}

export default Navbar;
