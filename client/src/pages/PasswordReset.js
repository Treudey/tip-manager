import React, { Component } from 'react';

import { validateForm } from '../utils/validators';

export default class PasswordReset extends Component {
  state = {
    passwordData: {
      password: '',
      confirmPassword: '',
      token: ''
    },
    errors: {
      password: '',
      confirmPassword: ''
    }
  }

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const passwordData = {...this.state.passwordData};
    passwordData.token = token;
    this.setState({ passwordData })
  }

  onChangeInput = (e) => {
    const errors = {...this.state.errors};

    if (errors[e.target.id].length) {
      errors[e.target.id] = '';
      this.setState({ errors });
    }
    
    const passwordData = {...this.state.passwordData};
    passwordData[e.target.id] = e.target.value.trim();
    this.setState({ passwordData });
  };

  handleSubmit = (e) => {
    e.preventDefault();

    const passwordData = {...this.state.passwordData};
    const errors = {...this.state.formErrors};

    for (const key in passwordData) {
      if (passwordData.hasOwnProperty(key)) {
        const value = passwordData[key];
        if (key === 'password') {
          errors.password = 
            !(value.length >= 5 && value.length <= 20)
              ? 'Your password must be between 5 and 20 characters long'
              : '';
        } else if (key === 'confirmPassword') {
          errors.confirmPassword = 
              value !== passwordData.password
                ? 'Your password and confirmation password do not match '
                : '';
        }
      }
    }

    if (!validateForm(errors)) {
      return this.setState({ errors });
    }

    this.props.onUpdate(passwordData);
  };

  render() {
    const errors = this.state.errors;
    return (
      <div>
        <h3>Submit New Password</h3>
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label>Password: </label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={this.state.passwordData.password}
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
                value={this.state.passwordData.confirmPassword}
                onChange={this.onChangeInput}
              />
              {errors.confirmPassword.length > 0 && 
                <span className='error text-danger'>{errors.confirmPassword}</span>}
            </div>
          <div className="form-group">
            <input 
              type="submit" 
              disabled={this.props.loading} 
              value={this.props.loading ? 'Loading...' : 'Update Password'} 
              className="btn btn-success" 
            />
          </div>
        </form>
      </div>
    );
    
  }
}