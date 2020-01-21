import React, { Component, Fragment } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import moment from 'moment';

import Table from '../components/Table';

export default class TipList extends Component {

  constructor(props) {
    super(props);

    this.deleteTip = this.deleteTip.bind(this);

    this.state = { 
      userID: props.userID,
      tips: []
     };
  } 

  componentDidMount() {
    axios.get('http://localhost:5000/tips/?userID=' + this.state.userID)
      .then(response => {
        console.log(response.data.message);
        this.setState({ tips: response.data.tips });
      })
      .catch(err => console.log(err));
  }

  deleteTip(id) {
    axios.delete('http://localhost:5000/tips/' + id, {
      data: {
        userID: this.state.userID
      }  
    })
      .then(res => console.log(res.data.message))
      .catch(err => console.log(err));

    this.setState({
      tips: this.state.tips.filter(el => el._id !== id)
    });
  }

  formatTipsForTable() {
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
  }

  render() {
    let tipListData;
    if (!this.state.tips.length) {
      tipListData = (<h2>You have no tips currently!</h2>);
    } else {
      console.log(this.formatTipsForTable());
      tipListData = (
        <Fragment>
          <Table headers={['Date', 'Position', 'Type of Shift', 'Amount', 'Shift Length', 'Actions']} delete={this.deleteTip} rowList={this.formatTipsForTable()} />
        </Fragment>
      );
    }

    return (
      <div className="container-fluid">
        <h1>Your Tips</h1>
        {tipListData}
      </div>
    );
  }
}