import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import axios from 'axios';

import ErrorModal from './components/ErrorModal';
import Modal from './components/Modal';
import Navigation from './components/Navigation';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AccountDetails from './pages/Account';
import NoMatch from './pages/NoMatch';
import AddTip from './pages/AddTip';
import EditTip from './pages/EditTip';
import TipList from './pages/TipList';
import ChartsPage from './pages/ChartsPage';
import PasswordReset from './pages/PasswordReset';
import NetworkDetector from './hoc/NetworkDetector';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import UploadPage from './pages/Upload';

class App extends Component {

  state = {
    isLoggedIn: false,
    userID: null,
    token: null,
    error: null,
    authLoading: false,
    triggerSuccessModal: false,
    successMessage: ''
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

  loginHandler = (loginData) => {
    this.setState({ authLoading: true });
    axios.post('/auth/login', loginData)
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
        if (err.response) {
          if (err.response.status === 422 ) {
            err = new Error('Validation failed.');
          } else if (err.response.status === 401) {
            err = new Error('The email and password you entered did not match our records. Please double-check and try again.');
          }
        }
        this.setState({
          isLoggedIn: false, 
          authLoading: false,
          error: err
        });
      });
  };

  passwordResetHandler = (email) => {
    this.setState({ authLoading: true });

    axios.post('/auth/reset', { email })
      .then(res => {
        this.setState({ 
          authLoading: false,
          triggerSuccessModal: true,
          successMessage: 'An email has been sent. Please check your email for the password reset email.'
        });
        console.log(res.data.message);
      })
      .catch(err => {
        console.log(err);
        if (err.response) {
          if (err.response.status === 422 ) {
            err = new Error('Validation failed.');
          } else if (err.response.status === 404) {
            err = new Error('Could not find an account associated with that email.');
          } else if (err.response.status === 403) {
            err = new Error('You have made 1 password request already today. Please wait 24 hours before attempting another.');
          } else {
            err = new Error('Could not send password reset email.')
          }
        } else {
          err = new Error('Could not send password reset email.')
        }
        this.setState({
          isLoggedIn: false, 
          authLoading: false,
          error: err
        });
      });
  };

  updatePasswordHandler = (passwordData) => {
    this.setState({ authLoading: true });

    axios.put('/auth/new-password', passwordData)
      .then(res => {
        this.setState({ 
          authLoading: false,
          triggerSuccessModal: true,
          successMessage: 'Password successfully updated'
        });
        console.log(res.data.message);
      })
      .catch(err => {
        console.log(err);
        if (err.response) {
          if (err.response.status === 422 ) {
            err = new Error('Validation failed.');
          } else if (err.response.status === 401) {
            err = new Error('The token is not valid or expired');
          } else {
            err = new Error('Could not update your password.')
          }
        } else {
          err = new Error('Could not update your password.')
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
    axios.post('/auth/signup', signupData)
      .then(res => {
        this.setState({ authLoading: false });
        this.props.history.replace('/');
      })
      .catch(err => {
        console.log(err);
        if (err.response) {
          if (err.response.status === 422) {
            err = new Error(
              "Validation failed"
            );
          } else if (err.response.status === 409) {
            err = new Error('An account with that email address already exists!');
          } else {
            err = new Error('Failed to create new user!');
          }
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

  handleSuccessModalClose = () => {
    this.setState({ triggerSuccessModal: false, successMessage: '' });
    this.props.history.replace('/');
    window.location.reload();
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
                onReset={this.passwordResetHandler}
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
          <Route 
            path="/reset" 
            render={props => (
              <PasswordReset 
                {...props}
                onUpdate={this.updatePasswordHandler}
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
              <AccountDetails
                {...props}
                token={this.state.token}
                onLogout={this.logoutHandler}
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
          <Route 
            exact path="/upload" 
            render={props => (
              <UploadPage 
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
        <Modal 
          title="Success!"
          acceptButtonText="Accept"
          show={this.state.triggerSuccessModal} 
          handleClose={this.handleSuccessModalClose} 
          handleAccept={this.handleSuccessModalClose}
        >
          <p>{this.state.successMessage}</p>
       </Modal>
        <Navigation onLogout={this.logoutHandler} isLoggedIn={this.state.isLoggedIn} />
        {routes}
      </Container>
    );
  }
}

export default NetworkDetector(withRouter(App));