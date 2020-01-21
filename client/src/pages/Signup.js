import React, { Component } from 'react';

export default class Signup extends Component {

  constructor(props) {
    super(props);

    this.onChangeInput = this.onChangeInput.bind(this);

    this.state = {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  }

  onChangeInput(e) {
    this.setState({
      [e.target.id]: e.target.value
    });
  }

  render() {
    return (
      <div>
        <h3>Sign Up</h3>
        <form onSubmit={ e => this.props.onSignup(e, this.state) }>
          <div className="form-group">
            <label>Username: </label>
            <input type="text"
              required
              id="name"
              className="form-control"
              value={this.state.username}
              onChange={e => this.onChangeInput(e)}
            />
          </div>
          <div className="form-group">
            <label>Email: </label>
            <input type="email"
              required
              id="email"
              className="form-control"
              value={this.state.email}
              onChange={e => this.onChangeInput(e)}
            />
          </div>
          <div className="form-group">
            <label>Password: </label>
            <input type="password"
              required
              id="password"
              className="form-control"
              value={this.state.password}
              onChange={e => this.onChangeInput(e)}
            />
          </div>
          <div className="form-group">
            <label>Confirm Password: </label>
            <input type="password"
              required
              id="confirmPassword"
              className="form-control"
              value={this.state.confirmPassword}
              onChange={e => this.onChangeInput(e)}
            />
          </div>
          <div className="form-group">
            <input type="submit" value="Register" className="btn btn-primary" />
          </div>
        </form>
      </div>
    );
  }
}