import React, { Component } from 'react';

import { validateForm } from '../utils/validators';

export default class Signup extends Component {

  state = {
    signupData: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    formErrors: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  }

  onChangeInput = (e) => {
    const errors = {...this.state.formErrors};

    if (errors[e.target.id].length) {
      errors[e.target.id] = '';
      this.setState({ formErrors: errors });
    }
    
    const signupData = {...this.state.signupData};
    signupData[e.target.id] = e.target.value.trim();
    this.setState({ signupData });
  };

  handleSubmit = (e) => {
    e.preventDefault();

    const signupData = {...this.state.signupData};
    const errors = {...this.state.formErrors};

    for (const key in signupData) {
      if (signupData.hasOwnProperty(key)) {
        const value = signupData[key];
        switch (key) {
          case 'email':
            errors.email = 
              !(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(
                value.toLowerCase()
              ))
                ? 'Please enter a valid email address'
                : '';
            break;
          case 'name':
            errors.name = 
              !(value.length >= 2 && value.length <= 20)
                ? 'Your user name must be between 2 and 20 characters long'
                : '';
            break;
          case 'password':
            errors.password = 
              !(value.length >= 5 && value.length <= 20)
                ? 'Your password must be between 5 and 20 characters long'
                : '';
            break;
          case 'confirmPassword':
            errors.confirmPassword = 
              !(value === signupData.password)
                ? 'Your password and confirmation password do not match '
                : '';
            break;
          default:
            break;
        }
      }
    }

    if (!validateForm(errors)) {
      return this.setState({ formErrors: errors });
    }

    this.props.onSignup(e, signupData);
  };

  render() {
    const signupData = this.state.signupData;
    const errors = this.state.formErrors;
    return (
      <div className="container-fluid">
        <h3>Sign Up</h3>
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label>Username: </label>
            <input 
              type="text"
              id="name"
              className="form-control"
              value={signupData.name}
              onChange={this.onChangeInput}
            />
            {errors.name.length > 0 && 
              <span className='error text-danger'>{errors.name}</span>}
          </div>
          <div className="form-group">
            <label>Email: </label>
            <input 
              type="email"
              id="email"
              className="form-control"
              value={signupData.email}
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
              value={signupData.password}
              onChange={this.onChangeInput}
            />
            {errors.password.length > 0 && 
              <span className='error text-danger'>{errors.password}</span>}
          </div>
          <div className="form-group">
            <label>Confirm Password: </label>
            <input 
              type="password"
              id="confirmPassword"
              className="form-control"
              value={signupData.confirmPassword}
              onChange={this.onChangeInput}
            />
            {errors.confirmPassword.length > 0 && 
              <span className='error text-danger'>{errors.confirmPassword}</span>}
          </div>
          <div className="form-group">
            <input 
              type="submit" 
              disabled={this.props.loading}
              value={this.props.loading ? 'Loading...' : 'Register'} 
              className="btn btn-success" 
            />
          </div>
        </form>
      </div>
    );
  }
}