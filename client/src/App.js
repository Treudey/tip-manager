import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import axios from 'axios';

import ErrorModal from './components/ErrorModal';
import Navigation from './components/Navigation';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AccountSettings from './pages/Account';
import NoMatch from './pages/NoMatch';
import AddTip from './pages/AddTip';
import EditTip from './pages/EditTip';
import TipList from './pages/TipList';
import ChartsPage from './pages/ChartsPage';
import NetworkDetector from './hoc/NetworkDetector';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';

class App extends Component {

  state = {
    isLoggedIn: false,
    userID: null,
    token: null,
    error: null,
    authLoading: false
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
    this.setState({ authLoading: true });
    axios.post('http://localhost:5000/auth/login', loginData)
      .then(res => {
        this.setState({
          isLoggedIn: true,
          userID: res.data.userID,
          token: res.data.token,
          authLoading: false
        });
        console.log(res.data.message);
        localStorage.setItem('userID', res.data.userID);
        localStorage.setItem('token', res.data.token);
        const millisecs = 60 * 60 * 1000;
        const expiryDate = new Date(Date.now() + millisecs);
        localStorage.setItem('expiryDate', expiryDate.toISOString());
        this.setAutoLogout(millisecs);
      })
      .catch(err => {
        console.log(err);
        if (err.response.status === 422 ) {
          err = new Error('Validation failed.');
        } else if (err.response.status === 401) {
          err = new Error('The email and password you entered did not match our records. Please double-check and try again');
        }
        this.setState({
          isLoggedIn: false, 
          authLoading: false,
          error: err
        });
      });
  };

  signupHandler = (event, signupData) => {
    event.preventDefault();
    this.setState({ authLoading: true });
    axios.post('http://localhost:5000/auth/signup', signupData)
      .then(res => {
        this.setState({ authLoading: false });
        this.props.history.replace('/');
      })
      .catch(err => {
        console.log(err);
        if (err.response.status === 422) {
          err = new Error(
            "Validation failed. Make sure the email address isn't used yet!"
          );
        } else if (err.response.status === 409) {
          err = new Error('Make sure the two passwords match.');
        } else {
          err = new Error('Failed to create new user!');
        }
        this.setState({
          isLoggedIn: false, 
          authLoading: false,
          error: err
        });
      });
  };

  logoutHandler = () => {
    this.setState({ isLoggedIn: false, token: null });
    localStorage.removeItem('token');
    localStorage.removeItem('expiryDate');
    localStorage.removeItem('userID');
    this.props.history.replace('/');
  };

  errorHandler = () => {
    this.setState({ error: null });
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
                loading={this.state.authLoading}
              />
            )} 
          />
          <Route 
            exact path="/signup" 
            render={props => (
              <SignupPage 
                {...props}
                onSignup={this.signupHandler}
                loading={this.state.authLoading}
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
            exact path="/account" 
            render={props => (
              <AccountSettings 
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
      <Container>
        <ErrorModal error={this.state.error} onHandle={this.errorHandler} />
        <Navigation onLogout={this.logoutHandler} isLoggedIn={this.state.isLoggedIn} />
        {routes}
      </Container>
    );
  }
}

export default NetworkDetector(withRouter(App));