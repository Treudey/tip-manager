import React, { Component } from 'react';
import { Route, Switch, withRouter } from "react-router-dom";
import axios from 'axios';

import "bootstrap/dist/css/bootstrap.min.css";
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import Dashboard from './pages/Dashboard';
import NoMatch from './pages/NoMatch';
import Navbar from './components/Navbar';

class App extends Component {

  state = {
    isLoggedIn: false,
    userID: null
  };

  componentDidMount() {
    let expiryDate = localStorage.getItem('expiryDate');
    if (!expiryDate) {
      return;
    }
    expiryDate = new Date(expiryDate).getTime();
    if (expiryDate <= Date.now()) {
      this.logoutHandler();
      return;
    }
    const userID = localStorage.getItem('userID');
    const timeLeft = expiryDate - Date.now();
    this.setState({ isLoggedIn: true, userID });
    this.setAutoLogout(timeLeft);
  }

  loginHandler = (event, loginData) => {
    event.preventDefault();
    axios.post('http://localhost:5000/auth/login', loginData)
      .then(res => {
        if (res.status === 422 ) {
          throw new Error('Validation failed.');
        }
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Could not be authenticated!');
        }
        this.setState({
          isLoggedIn: true,
          userID: res.data.userID
        });
        console.log(res.data);
        localStorage.setItem('userID', res.data.userID);
        const millisecs = 90 * 60 * 1000;
        const expiryDate = new Date(Date.now() + millisecs);
        localStorage.setItem('expiryDate', expiryDate.toISOString());
        this.setAutoLogout(millisecs);
        
      })
      .catch(err => console.log(err));
  };

  signupHandler = (event, signupData) => {
    event.preventDefault();
    axios.post('http://localhost:5000/auth/signup', signupData)
      .then(res => {
        if (res.status === 422 ) {
          throw new Error('Validation failed.');
        }
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Could not create new user!');
        }
        
        this.props.history.replace('/');
      })
      .catch(err => console.log(err));
  };

  logoutHandler = () => {
    this.setState({ isLoggedIn: false });
    localStorage.removeItem('expiryDate');
    localStorage.removeItem('userID');
  };

  setAutoLogout = millisecs => {
    setTimeout(() => {
      this.logoutHandler();
    }, millisecs);
  };

  render() {

    let routes;
    if (this.state.isLoggedIn === false) {
      routes = (
        <Switch>
          <Route 
            exact path="/" 
            render={props => (
              <LoginPage 
                {...props}
                onLogin={this.loginHandler}
              />
            )} 
          />
          <Route 
            exact path="/signup" 
            render={props => (
              <SignupPage 
                {...props}
                onSignup={this.signupHandler}
              />
            )}
          />
          <Route component={NoMatch} />
        </Switch>
      );
    } else if (this.state.isLoggedIn === true) {
      routes = (
        <Switch>
          <Route 
            exact path="/" 
            render={props => (
              <Dashboard 
                {...props}
                userID={this.state.userID}
              />
            )} 
          />
          <Route component={NoMatch} />
        </Switch>
      );
    }

    return (
      <div className="container">
        <Navbar 
          onLogout={this.logoutHandler}
          isLoggedIn={this.state.isLoggedIn}
        />
        {routes}
      </div>
    );
  }
}

export default withRouter(App);