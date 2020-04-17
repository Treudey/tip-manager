import React, { Component, Fragment } from 'react';
import axios from 'axios';
import moment from 'moment';

import Table from '../components/Table';
import ErrorModal from '../components/ErrorModal';
import ConfirmModal from '../components/ConfirmModal';
import Loader from '../components/Loader';

export default class TipList extends Component {

  state = { 
    token: this.props.token,
    tips: [],
    error: null,
    tipsLoading: true,
    enableConfirmModal: false,
    tipToBeDeleted: null
  };

  componentDidMount() {
    axios.get('/tips/', { 
      headers: {
        Authorization: 'Bearer ' + this.state.token
      }
    })
      .then(response => {
        console.log(response.data.message);
        this.setState({ 
          tips: response.data.tips,
          tipsLoading: false
        });
      })
      .catch(err => {
        console.log(err);
        err = new Error('Failed to load tips.');
        this.setState({ error: err });
      });
  }

  downloadCSV = () => {
    axios.get('/tips/download', {
      headers: {
        Authorization: 'Bearer ' + this.state.token
      },
      responseType: 'blob'
    })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'tips.csv');
        document.body.appendChild(link);
        link.click();
      })
      .catch(err => {
        console.log(err);
        err = new Error('Couldn\'t download CSV file');
        this.setState({ error: err });
      });
  };

  deleteTip = (id) => {
    this.setState({ tipsLoading: true, enableConfirmModal: false });
    axios.delete('/tips/' + id, {
      headers: {
        Authorization: 'Bearer ' + this.state.token
      }
    })
      .then(res => {
        console.log(res.data.message);
        this.setState({
          tips: this.state.tips.filter(el => el._id !== id),
          tipsLoading: false
        });
      })
      .catch(err => {
        console.log(err);
        err = new Error('Failed to delete the post.');
        this.setState({ error: err, tipsLoading: false });
      });
  };

  formatTipsForTable = () => {
    return this.state.tips.map(tip => {
      return {
        date: moment(tip.date).format('DD/MM/YY ddd'),
        position: tip.position,
        shiftType: tip.shiftType,
        amount: '$' + tip.amount,
        shiftLength: tip.shiftLength,
        id: tip._id,
      };
    });
  };

  handleDeleteButton = (id) => {
    this.setState({
      enableConfirmModal: true,
      tipToBeDeleted: id
    })
  };

  cancelConfirmModal = () => {
    this.setState({
      enableConfirmModal: false,
      tipToBeDeleted: null
    });
  }

  errorHandler = () => {
    this.setState({ error: null });
  };

  render() {
    let loadedHtml;
    if (!this.state.tips.length) {
      loadedHtml = (<h2>You have no tips currently!</h2>);
    } else {
      loadedHtml = (
        <Fragment>
          <a className="padded" href="# " onClick={this.downloadCSV}>Download Your Tips as a CSV File</a>
          <Table 
            headers={['Date', 'Position', 'Type of Shift', 'Amount', 'Shift Length', 'Actions']} 
            delete={this.handleDeleteButton} 
            rowData={this.formatTipsForTable()} 
          />
        </Fragment>
      );
    }

    return (
      <div className="container">
        <ErrorModal error={this.state.error} onHandle={this.errorHandler} />
        <ConfirmModal 
          isEnabled={this.state.enableConfirmModal} 
          onConfirm={() => this.deleteTip(this.state.tipToBeDeleted)} 
          onCancel={this.cancelConfirmModal} 
        />
        <h1 className="padded">Your Tips</h1>
        {this.state.tipsLoading ? (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Loader />
          </div>
        ) : loadedHtml}
      </div>
    );
  }
}