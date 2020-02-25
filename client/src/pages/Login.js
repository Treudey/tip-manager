import React, { Component } from 'react';

export default class Login extends Component {
  state = {
    loginData: {
      email: '',
      password: ''
    }
  }
  
  onChangeInput = (e) => {
    const loginData = {...this.state.loginData};
    loginData[e.target.id] = e.target.value
    this.setState({ loginData });
  }

  render() {
    const loginData = this.state.loginData;
    return (
      <div>
        <h3>Login</h3>
        <form onSubmit={ e => this.props.onLogin(e, loginData) }>
          <div className="form-group">
            <label>Email: </label>
            <input type="email"
              required
              id="email"
              className="form-control"
              value={loginData.email}
              onChange={e => this.onChangeInput(e)}
            />
          </div>
          <div className="form-group">
            <label>Password: </label>
            <input type="password"
              required
              id="password"
              className="form-control"
              value={loginData.password}
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