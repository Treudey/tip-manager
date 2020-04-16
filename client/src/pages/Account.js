import React, { Component, Fragment } from 'react';
import axios from 'axios';

import ErrorModal from '../components/ErrorModal';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { validateForm } from '../utils/validators';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import './Account.css'

export default class AccountDetails extends Component {
  state = {
    token: this.props.token,
    userData: {
      name: '',
      email: ''
    },
    formData: {
      name: '',
      email: '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      isPasswordChange: false
    },
    formErrors: {
      name: '',
      email: '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      passwordForDeleteAccount: ''
    },
    passwordForDeleteAccount: '',
    disableSubmit: true,
    passwordFormEnabled: false,
    error: null,
    dataLoading: true,
    formLoading: false,
    userUpdated: false,
    messageTimer: null,
    showDeleteButton: false,
    enableConfirmModal: false
  }

  componentDidMount() {
    axios.get('/auth/userdata', { 
      headers: {
        Authorization: 'Bearer ' + this.state.token
      }
    })
      .then(response => {
        console.log(response.data.message);
        const user = response.data.user;
        const formData = {...this.state.formData};
        formData.name = user.name;
        formData.email = user.email;
        this.setState({
          userData: {
            name: user.name,
            email: user.email
          },
          formData,
          dataLoading: false
        });
      })
      .catch(err => {
        console.log(err);
        err = new Error('Failed to load user data.');
        this.setState({ error: err });
      });
  }

  componentWillUnmount() {
    clearTimeout(this.state.messageTimer);
  }

  onChangeInput = (e) => {
    const errors = {...this.state.formErrors};
     
    if (errors[e.target.id].length) {
      errors[e.target.id] = '';
      this.setState({ formErrors: errors });
    }

    if (e.target.id === 'passwordForDeleteAccount') {
      return this.setState({ passwordForDeleteAccount: e.target.value });
    }

    const formData = {...this.state.formData};
    formData[e.target.id] = e.target.value.trim();
    this.setState({ formData }, () => {
      if (this.state.passwordFormEnabled) {
        return;
      } else if (
        this.state.formData.name !== this.state.userData.name || 
        this.state.formData.email !== this.state.userData.email
      ) {
        this.setState({ disableSubmit: false });
      } else {
        this.setState({ disableSubmit: true });
      }
    });
  };

  onSubmitForm = (e) => {
    e.preventDefault();
    this.setState({ formLoading: true });

    const formData = {...this.state.formData};
    const errors = {...this.state.formErrors};

    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        const value = formData[key];
        if (key === 'email') {
          errors.email = 
            !(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(
              value.toLowerCase()
            ))
              ? 'Please enter a valid email address'
              : '';
        } else if (key === 'name') {
          errors.name = 
            !(value.length >= 2 && value.length <= 20)
              ? 'Your user name must be between 2 and 20 characters long'
              : '';
        } else if (key === 'oldPassword' && formData.isPasswordChange) {
          errors.oldPassword = 
            !(value.length >= 5 && value.length <= 20)
              ? 'All passwords must be between 5 and 20 characters long'
              : '';
        } else if (key === 'newPassword' && formData.isPasswordChange) {
          errors.newPassword = 
            !(value.length >= 5 && value.length <= 20)
              ? 'Your new password must be between 5 and 20 characters long'
              : '';
        } else if (key === 'confirmPassword' && formData.isPasswordChange) {
          errors.confirmPassword = 
            !(value === formData.newPassword)
              ? 'Your new password and confirmation password do not match '
              : '';
        }
      }
    }

    if (!validateForm(errors)) {
      return this.setState({ formErrors: errors, formLoading: false });
    }

    axios.put('/auth/update', formData, { 
        headers: {
          Authorization: 'Bearer ' + this.state.token
        }
      })
        .then(res => {
          console.log(res.data.message);
          this.setState({ 
            userData: {
              name: formData.name,
              email: formData.email
            },
            passwordFormEnabled: false,
            disableSubmit: true,
            userUpdated: true,
            messageTimer: setTimeout(() => this.setState({ userUpdated: false }), 3000)
          }, this.resetData);
        })
        .catch(err => {
          console.log(err);
          
          if (err.response) {
            if (err.response.status === 422) {
              err = new Error("Validation failed.");
            } else if (err.response.status === 401) {
              err = new Error("You did not enter the correct old password. Please try again");
            } else if (err.response.status === 409) {
              err = new Error('An account with that email address already exists!');
            } else {
              err = new Error('Can\'t update user data!');
            }
          } else {
            err = new Error('Can\'t update user data!');
          }
          this.setState({ error: err}, this.resetData);
        });
  };

  enablePasswordForm = () => {
    const formData = {...this.state.formData};
    formData.isPasswordChange = true;
    this.setState({ 
      passwordFormEnabled: true,
      disableSubmit: false,
      formData
    });
  };

  disablePasswordForm = () => {
    const formData = {...this.state.formData};
    formData.isPasswordChange = false;
    formData.oldPassword = '';
    formData.newPassword = '';
    formData.confirmPassword ='';
    const formErrors = {...this.state.formErrors};
    formErrors.oldPassword = '';
    formErrors.newPassword = '';
    formErrors.confirmPassword = '';
    let disableSubmit = true;
    if (formData.name !== this.state.userData.name || 
        formData.email !== this.state.userData.email) 
    {
      disableSubmit = false;
    }
    this.setState({
      passwordFormEnabled: false,
      disableSubmit,
      formData,
      formErrors
    });
  };

  deleteAccountHandler = () => {
    const errors = {...this.state.formErrors};
    const password = this.state.passwordForDeleteAccount;

    errors.passwordForDeleteAccount = 
            !(password.length >= 5 && password.length <= 20)
              ? 'All passwords must be between 5 and 20 characters long'
              : '';

    if (errors.passwordForDeleteAccount.length) {
      return this.setState({ formErrors: errors, formLoading: false });
    }

    axios.put('/auth/delete', {password}, { 
      headers: {
        Authorization: 'Bearer ' + this.state.token
      }
    })
      .then(res => {
        console.log(res.data.message);
        this.setState({ enableConfirmModal: false });
        this.props.onLogout();
      })
      .catch(err => {
        console.log(err);
        if (err.response) {
          if (err.response.status === 401) {
            err = new Error('You provided the incorrect password.'); 
          } else {
            err = new Error('Failed to delete the account.');
          }
        } else {
          err = new Error('Failed to delete the account.');
        }
        this.setState({ 
          error: err, 
          enableConfirmModal: false,
          passwordForDeleteAccount: ''
        });
      });
  };

  deleteButtonHandler = () => {
    this.setState({ enableConfirmModal: true });
  };
  
  cancelConfirmModal = () => {
    const errors = {...this.state.formErrors};
    errors.passwordForDeleteAccount = '';
    this.setState({ 
      enableConfirmModal: false,
      passwordForDeleteAccount: '',
      formErrors: errors
    });
  }

  resetData = () => {
    const formData = {...this.state.formData};
    formData.oldPassword = '';
    formData.newPassword = '';
    formData.confirmPassword = '';
    formData.isPasswordChange = false;
    this.setState({ 
      formData,
      formLoading: false, 
    });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  render() {
    const errors = this.state.formErrors;
    return (
      <Container fluid>
        <ErrorModal error={this.state.error} onHandle={this.errorHandler} />
        <Modal 
          acceptButtonText="Confirm"
          title="Delete Your Account"
          show={this.state.enableConfirmModal} 
          handleClose={this.cancelConfirmModal}
          handleAccept={this.deleteAccountHandler}
        >
          <p>This action cannot be undone. Please enter your password to confirm your decision.</p>
          <label>Password:</label>
          <input 
            type="password" 
            className="form-control" 
            id="passwordForDeleteAccount"
            value={this.state.passwordForDeleteAccount}
            onChange={this.onChangeInput}
          ></input>
          {errors.passwordForDeleteAccount.length > 0 && 
            <span className='error text-danger'>{errors.passwordForDeleteAccount}</span>}
        </Modal>
        <Row>
          <Col>
            <h1>Account Details</h1>
          </Col>
        </Row>
        {this.state.dataLoading ? (
          <Row>
            <Col>
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Loader />
              </div>
            </Col>
          </Row>
        ) : (
          <Fragment>
          <Row>
            <Col>
              <Form style={{width: "100%"}} onSubmit={this.onSubmitForm}>
                <Form.Group as={Row}>
                  <Form.Label column sm={2}>Name: </Form.Label>
                  <Col sm={10}>
                    <Form.Control 
                      type="text"
                      id="name"
                      value={this.state.formData.name}
                      onChange={this.onChangeInput}
                    />
                    {errors.name.length > 0 && 
                      <span className='error text-danger'>{errors.name}</span>}
                  </Col>
                </Form.Group>
                <div className="form-group row">
                  <label className="col-sm-2 col-form-label">Email: </label>
                  <div className="col-sm-10">
                    <input 
                      type="email" 
                      className="form-control"
                      id="email"
                      value={this.state.formData.email}
                      onChange={this.onChangeInput}
                    />
                    {errors.email.length > 0 && 
                      <span className='error text-danger'>{errors.email}</span>}
                  </div>
                </div>
                
                {!this.state.passwordFormEnabled ? (
                  <div className="form-group row"> 
                    <label className="col-sm-2 col-form-label">Password: </label>
                    <div className="col-sm-10">
                      <input  
                        type="password"
                        className="form-control"
                        id="password"
                        defaultValue
                        onFocus={this.enablePasswordForm}
                      />
                    </div>
                  </div>
                ) : (
                  <Fragment>
                    <div className="form-group row">
                      <label className="col-sm-2 col-form-label">Old Password: </label>
                      <div className="col-sm-9">
                        <input 
                          type="password" 
                          className="form-control"
                          id="oldPassword"
                          value={this.state.formData.oldPassword}
                          onChange={this.onChangeInput}
                          autoFocus
                        />
                        {errors.oldPassword.length > 0 && 
                          <span className='error text-danger'>{errors.oldPassword}</span>}
                      </div>
                      <div className="col-sm-1">
                        <button className="btn btn-danger" onClick={this.disablePasswordForm}>
                          Cancel
                        </button>
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-sm-2 col-form-label">New Password: </label>
                      <div className="col-sm-10">
                        <input 
                          type="password" 
                          className="form-control"
                          id="newPassword"
                          value={this.state.formData.newPassword}
                          onChange={this.onChangeInput}
                        />
                        {errors.newPassword.length > 0 && 
                          <span className='error text-danger'>{errors.newPassword}</span>}
                      </div>
                    </div>
                    <div className="form-group row">
                      <label className="col-sm-2 col-form-label">Confirm Password: </label>
                      <div className="col-sm-10">
                        <input 
                          type="password" 
                          className="form-control"
                          id="confirmPassword"
                          value={this.state.formData.confirmPassword}
                          onChange={this.onChangeInput}
                        />
                        {errors.confirmPassword.length > 0 && 
                          <span className='error text-danger'>{errors.confirmPassword}</span>}
                      </div>
                    </div>
                  </Fragment>
                )}
                
                <Form.Group as={Row}>
                  <Col sm={{ span: 10, offset: 2 }}>
                    <Button 
                      type="submit" 
                      disabled={this.state.formLoading || this.state.disableSubmit}
                      className="btn btn-success" 
                    >
                      {this.state.formLoading ? 'Loading...' : 'Save Changes'}
                    </Button>
                  </Col>
                </Form.Group>
              </Form>
              {this.state.userUpdated && 
                <span className="text-success" >User Info Updated!</span>}
            </Col>
          </Row>
          <Row>
            <div className="delete-account">
              <h4 className="delete-account__header">Delete Account</h4>
              <div className="delete-account__box">
                {this.state.showDeleteButton ? (
                  <Button 
                    variant="danger"
                    onClick={this.deleteButtonHandler}
                  >
                    Delete Account
                  </Button>
                ) : (
                  <p 
                    className='delete-account__link' 
                    onClick={() => this.setState({ showDeleteButton: true })}
                  >
                    Want to Delete Your Account?
                  </p>
                )}
              </div>
            </div>
          </Row>
          </Fragment>
        )}
      </Container>
    );
  }
}