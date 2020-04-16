import React, { Component, Fragment } from 'react';

import { validateForm } from '../utils/validators';
import { Button } from 'react-bootstrap';
import './Login.css'

export default class Login extends Component {
  state = {
    loginData: {
      email: '',
      password: ''
    },
    formErrors: {
      email: '',
      password: '',
      resetEmail: ''
    },
    resetEmail: '',
    resetPasswordEnabled: false
  }
  
  onChangeInput = (e) => {
    const errors = {...this.state.formErrors};
    const value = e.target.value.trim();
    if (errors[e.target.id].length) {
      errors[e.target.id] = '';
      this.setState({ formErrors: errors });
    }

    if (e.target.id === 'resetEmail') {
      return this.setState({ resetEmail: value });
    }

    const loginData = {...this.state.loginData};
    loginData[e.target.id] = value;
    this.setState({ loginData });
  };

  handleSubmit = (e) => {
    e.preventDefault();

    const loginData = {...this.state.loginData};
    const errors = {...this.state.formErrors};

    for (const key in loginData) {
      if (loginData.hasOwnProperty(key)) {
        const value = loginData[key];
        if (key === 'email'){
          errors.email = 
            !(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(
              value.toLowerCase()
            ))
              ? 'Please enter a valid email address'
              : '';
        } else if (key === 'password') {
          errors.password = 
            !(value.length >= 5 && value.length <= 20)
              ? 'Your password must be between 5 and 20 characters long'
              : '';
        }
      }
    }

    if (!validateForm(errors)) {
      return this.setState({ formErrors: errors });
    }

    this.props.onLogin(loginData);
  };

  handlePasswordReset = (e) => {
    e.preventDefault();
    const errors = {...this.state.formErrors};

    errors.resetEmail = 
      !(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(
        this.state.resetEmail.toLowerCase()
      )) ? 'Please enter a valid email address' : '';

      if (!validateForm(errors)) {
        return this.setState({ formErrors: errors });
      }

    this.props.onReset(this.state.resetEmail);
  };

  render() {
    const loginData = this.state.loginData;
    const errors = this.state.formErrors;
    return (
      <div className="container-fluid">
        <h3>Login</h3>
        {!this.state.resetPasswordEnabled ? (
          <Fragment>
            <form onSubmit={this.handleSubmit}>
              <div className="form-group">
                <label>Email: </label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  value={loginData.email}
                  onChange={this.onChangeInput}
                />
                {errors.email.length > 0 && 
                  <span className='error text-danger'>{errors.email}</span>}
              </div>
              <div className="form-group">
                <label>Password: </label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  value={loginData.password}
                  onChange={this.onChangeInput}
                />
                {errors.password.length > 0 && 
                  <span className='error text-danger'>{errors.password}</span>}
              </div>
              <div className="form-group">
                <input 
                  type="submit" 
                  disabled={this.props.loading} 
                  value={this.props.loading ? 'Loading...' : 'Log In'} 
                  className="btn btn-success" 
                />
              </div>
            </form>
            <p 
              className='forgotPwd' 
              onClick={() => this.setState({ resetPasswordEnabled: true })}
            >
              Forgot Password?
            </p>
          </Fragment>
        ): (
          <Fragment>
            <Button 
              variant="danger" 
              onClick={() => this.setState({ resetPasswordEnabled: false, resetEmail: '' })}
            >
              X
            </Button>
            <form onSubmit={this.handlePasswordReset}>
              <div className="form-group">
                <label>Email: </label>
                <input
                  type="email"
                  id="resetEmail"
                  className="form-control"
                  value={this.state.resetEmail}
                  onChange={this.onChangeInput}
                />
                {errors.resetEmail.length > 0 && 
                  <span className='error text-danger'>{errors.resetEmail}</span>}
              </div>
              <div className="form-group">
                <Button
                  type="submit"
                  disabled={this.props.loading}
                  variant="success"
                >
                  {this.props.loading ? 'Loading...' : 'Reset Password'}
                </Button>
              </div>
            </form>
          </Fragment>
        )}
      </div>
    );
  }
}