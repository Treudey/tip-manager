import React, { Component } from 'react';
import { Route, Switch, withRouter } from "react-router-dom";
import axios from 'axios';

import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from './components/Navbar';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import Dashboard from './pages/Dashboard';
import NoMatch from './pages/NoMatch';
import AddTip from './pages/AddTip';
import EditTip from './pages/EditTip';
import TipList from './pages/TipList';
import ChartsPage from './pages/ChartsPage';

class App extends Component {

  state = {
    isLoggedIn: false,
    userID: null,
    token: null
  };

  componentDidMount() {
    const token = localStorage.getItem('token');
    let expiryDate = localStorage.getItem('expiryDate');
    if (!token || !expiryDate) {
      return;
    }
    expiryDate = new Date(expiryDate).getTime();
    if (expiryDate <= Date.now()) {
      this.logoutHandler();
      return;
    }
    const userID = localStorage.getItem('userID');
    const timeLeft = expiryDate - Date.now();
    this.setState({ isLoggedIn: true, userID, token });
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
          userID: res.data.userID,
          token: res.data.token
        });
        console.log(res.data.message);
        localStorage.setItem('userID', res.data.userID);
        localStorage.setItem('token', res.data.token);
        const millisecs = 60 * 60 * 1000;
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
          throw new Error('Validation failed. Make sure the email address isn\'t already being used');
        }
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Could not create new user!');
        }
        
        this.props.history.replace('/');
      })
      .catch(err => console.log(err));
  };

  logoutHandler = () => {
    this.setState({ isLoggedIn: false, token: null });
    localStorage.removeItem('token');
    localStorage.removeItem('expiryDate');
    localStorage.removeItem('userID');
    this.props.history.replace('/');
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
                token={this.state.token}
              />
            )} 
          />
          <Route 
            exact path="/alltips" 
            render={props => (
              <TipList 
                {...props}
                token={this.state.token}
              />
            )} 
          />
          <Route 
            exact path="/charts" 
            render={props => (
              <ChartsPage 
                {...props}
                token={this.state.token}
              />
            )} 
          />
          <Route 
            exact path="/add" 
            render={props => (
              <AddTip 
                {...props}
                token={this.state.token}
              />
            )} 
          />
          <Route 
            exact path="/edit/:id" 
            render={props => (
              <EditTip
                {...props}
                token={this.state.token}
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