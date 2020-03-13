import React, { Component } from 'react';
import axios from 'axios';

import Modal from '../components/Modal';
import ErrorModal from '../components/ErrorModal';
import getSafe from '../utils/getSafe';

export default class UploadPage extends Component {

  state = {
    token: this.props.token,
    file: null,
    triggerSuccessModal: false,
    successMessage: '',
    error: null,
    formLoading: false
  }

  fileInput = React.createRef();

  sumbitHandler = (e) => {
    e.preventDefault();
    this.setState({ formLoading: true });
    
    const file = getSafe(() => this.fileInput.current.files[0], false); 
    if (!file) {
      const error = new Error('You did not choose a file.');
      return this.setState({ error, formLoading: false })
    }

    const formData = new FormData();
    formData.append('csv', file);
    console.log(this.fileInput.current.files[0]);
    axios.post('/tips/upload', formData, { 
      headers: {
        Authorization: 'Bearer ' + this.state.token
      }
    })
      .then(res => {
        console.log(res.data.message);
        this.setState({ 
          formLoading: false,
          successMessage: 'You have succesfully uploaded your file.',
          triggerSuccessModal: true
        });
      })
      .catch(err => {
        console.log(err);
        if (err.response.status) {
          if (err.response.status === 400) {
            err = new Error('You uploaded an invalid file type.');
          } else if (err.response.status === 422) {
            err = new Error('Your CSV file was incorrectly formatted.');
          } else {
            err = new Error('Failed to upload file.');
          }
        } else {
          err = new Error('Failed to upload file.');
        }
        this.setState({ error: err, formLoading: false });
      });
  };

  handleModalClose = () => {
    this.setState(
      { 
        triggerSuccessModal: false, 
        successMessage: '' 
      }, 
      () => {
        this.props.history.replace('/alltips');
    });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  render() {
    return (
      <div className='container-fluid'>
        <ErrorModal error={this.state.error} onHandle={this.errorHandler} />
        <Modal 
          title="Success!"
          acceptButtonText="Accept"
          show={this.state.triggerSuccessModal} 
          handleClose={this.handleModalClose} 
          handleAccept={this.handleModalClose}
        >
          <p>{this.state.successMessage}</p>
        </Modal>
        <h3>Upload a CSV File</h3>

        <p>Make sure you format your in ther order of: </p>
        <p>Date | Position | Type of Shift | Amount | Length of Shift (hrs)</p> 
        <p>Exactly as shown below. Also ensure that the date is mm/dd/yyyy.</p>

        <table className="table table-bordered">
          <tbody>
            <tr>
              <td>05/22/2020</td>
              <td>Bartender</td>
              <td>Open</td>
              <td>55</td>
              <td>7.5</td>
            </tr>
          </tbody>
        </table>

        <form onSubmit={this.sumbitHandler}>
          <div className="form-group">
            <label>CSV File: </label>
            <input  
                type="file"
                className="form-control-file"
                id="csv"
                ref={this.fileInput}
            />
          </div>
          <div className="form-group">
            <input 
              type="submit" 
              disabled={this.state.formLoading}
              value={this.state.formLoading ? 'Loading...' : 'Upload File'} 
              className="btn btn-primary" 
            />
          </div>
        </form>
      </div>
    );
    
  }
}