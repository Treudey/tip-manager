import React, { Component, Fragment } from 'react';
import axios from 'axios';
import moment from 'moment';

import Table from '../components/Table';
import ErrorModal from '../components/ErrorModal';

export default class TipList extends Component {

  state = { 
    token: this.props.token,
    tips: [],
    error: null
  };

  componentDidMount() {
    axios.get('http://localhost:5000/tips/', { 
      headers: {
        Authorization: 'Bearer ' + this.state.token
      }
    })
      .then(response => {
        console.log(response.data.message);
        this.setState({ tips: response.data.tips });
      })
      .catch(err => {
        console.log(err);
        err = new Error('Failed to load tips.');
        this.setState({ error: err });
      });
  }

  deleteTip = (id) => {
    axios.delete('http://localhost:5000/tips/' + id, {
      headers: {
        Authorization: 'Bearer ' + this.state.token
      }, 
    })
      .then(res => {
        console.log(res.data.message);
        this.setState({
          tips: this.state.tips.filter(el => el._id !== id)
        });
      })
      .catch(err => {
        console.log(err);
        err = new Error('Failed to delete the post.');
        this.setState({ error: err });
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

  errorHandler = () => {
    this.setState({ error: null });
  };

  render() {
    let tipListData;
    if (!this.state.tips.length) {
      tipListData = (<h2>You have no tips currently!</h2>);
    } else {
      tipListData = (
        <Fragment>
          <Table headers={['Date', 'Position', 'Type of Shift', 'Amount', 'Shift Length', 'Actions']} delete={this.deleteTip} rowData={this.formatTipsForTable()} />
        </Fragment>
      );
    }

    return (
      <div className="container-fluid">
        <ErrorModal error={this.state.error} onHandle={this.errorHandler} />
        <h1>Your Tips</h1>
        {tipListData}
      </div>
    );
  }
}