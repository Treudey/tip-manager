import React, { Component } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';

const Tip = props => (
  <tr>
    <td>{props.tip.date.substring(0,10)}</td>
    <td>${props.tip.amount}</td>
    <td>{props.tip.shiftLength} hrs</td>
    <td>
      <Link to={"/edit/" + props.tip._id}>Edit</Link> | <a href="#" onClick={ () => props.deleteTip(props.tip._id) }>Delete</a>
    </td>
  </tr>
);


export default class Dashboard extends Component {

  constructor(props) {
    super(props);

    this.deleteTip = this.deleteTip.bind(this);

    this.state = { 
      name: '',
      email: '',
      password: '',
      tips: [],
      tipInfo: {
        total: 0,
        totalYear: 0,
        totalMonth: 0,
        average: 0,
        hourly: 0
      }
     };
  } 

  componentDidMount() {
    axios.get('http://localhost:5000/auth/userdata?userID=' + this.props.userID)
      .then(response => {
        console.log(response.data.message);
        const user = response.data.user;
        this.setState({ 
          name: user.name,
          email: user.email,
          password: user.password,
          tips: user.tips
        });
        this.generateTipInfo();
      })
      .catch(err => console.log(err));
  }

  generateTipInfo() {
    let total = 0;
    let totalYear = 0;
    let totalMonth = 0;
    let hours = 0;

    this.state.tips.forEach(e => total += e.amount);
    let average = total / this.state.tips.length;
    average = average.toFixed(2);

    this.state.tips.forEach(e => hours += e.shiftLength);
    let hourly = total / hours;
    hourly = hourly.toFixed(2);

    const currentYear = new Date().getFullYear();
    const currentYearTips = this.state.tips.filter(e => {
      return new Date(e.date).getFullYear() === currentYear;
    });
    currentYearTips.forEach(e => totalYear += e.amount);

    const currentMonth = new Date().getMonth();
    const currentMonthTips = this.state.tips.filter(e => {
      return new Date(e.date).getMonth() === currentMonth;
    });
    currentMonthTips.forEach(e => totalMonth += e.amount);

    this.setState({
      tipInfo: {
        total,
        totalYear,
        totalMonth,
        average,
        hourly
      }
    })
  }

  deleteTip(id) {
    axios.delete('http://localhost:5000/tips/' + id, {
      data: {
        userID: this.props.userID
      }  
    })
      .then(res => console.log(res.data))
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
    return (
      <div className="container-fluid">
        <div className="row jumbotron text-center">
          <div className="col-12">
            <h1 className="display-2">Welcome {this.state.name}</h1>
          </div>
          <div className="col-12">
            <p>Total Tips Made: ${this.state.tipInfo.total}</p>
            <p>Tips Made This Year: ${this.state.tipInfo.totalYear}</p>
            <p>Tips Made This Month: ${this.state.tipInfo.totalMonth}</p>
            <p>Average Tips per Shift: ${this.state.tipInfo.average}</p>
            <p>Hourly: ${this.state.tipInfo.hourly}/hr</p>
          </div>
        </div>
        <div className="row">
          <h2>Your Tips</h2>
          <table className="table">
            <thead className="thead-light">
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Shift Length</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {this.tipList()}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}