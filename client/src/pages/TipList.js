import React, { Component } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import moment from 'moment';

const Tip = props => (
  <tr>
    <td>{moment(props.tip.date).format('DD/MM/YY ddd')}</td>
    <td>{props.tip.position}</td>
    <td>{props.tip.shiftType}</td>
    <td>${props.tip.amount}</td>
    <td>{props.tip.shiftLength} hrs</td>
    <td>
      <Link to={"/edit/" + props.tip._id}>Edit</Link> | <a href="#" onClick={ () => props.deleteTip(props.tip._id) }>Delete</a>
    </td>
  </tr>
);


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

  tipList() {
    return this.state.tips.map(tip => {
      return <Tip tip={tip} deleteTip={this.deleteTip} key={tip._id} />;
    })
  }

  render() {
    let tipListData;
    if (!this.state.tips.length) {
      tipListData = (<h2>You have no tips currently!</h2>);
    } else {
      tipListData = (
        <table className="table">
          <thead className="thead-light">
            <tr>
              <th>Date</th>
              <th>Position</th>
              <th>Type of Shift</th>
              <th>Amount</th>
              <th>Shift Length</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.tipList()}
          </tbody>
        </table>
      );
    }

    return (
      <div className="container-fluid">
        <div className="row">
          <h1>Your Tips</h1>
          {tipListData}
        </div>
      </div>
    );
  }
}