import React, { Component } from 'react';

export default class Login extends Component {

  constructor(props) {
    super(props);

    this.onChangeInput = this.onChangeInput.bind(this);

    this.state = {
      email: '',
      password: ''
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
        <h3>Login</h3>
        <form onSubmit={ e => this.props.onLogin(e, this.state) }>
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
            <input type="submit" value="Log In" className="btn btn-primary" />
          </div>
        </form>
      </div>
    );
  }
}