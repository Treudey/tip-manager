import React, { Component } from 'react';

import { validateForm } from '../utils/validators';

export default class Login extends Component {
  state = {
    loginData: {
      email: '',
      password: ''
    },
    formErrors: {
      email: '',
      password: ''
    }
  }
  
  onChangeInput = (e) => {
    const errors = {...this.state.formErrors};

    if (errors[e.target.id].length) {
      errors[e.target.id] = '';
      this.setState({ formErrors: errors });
    }
    
    const loginData = {...this.state.loginData};
    loginData[e.target.id] = e.target.value.trim();
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

    console.log(errors);
    if (!validateForm(errors)) {
      return this.setState({ formErrors: errors });
    }

    this.props.onLogin(e, loginData);
  };

  render() {
    const loginData = this.state.loginData;
    const errors = this.state.formErrors;
    return (
      <div>
        <h3>Login</h3>
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
              className="btn btn-primary" 
            />
          </div>
        </form>
      </div>
    );
  }
}