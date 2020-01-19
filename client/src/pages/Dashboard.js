import React, { Component } from 'react';
import axios from 'axios';
import moment from 'moment';

const Row = props => (
  <tr>
    <td>{props.name}</td>
    <td>${props.rowData.total}</td>
    <td>{props.rowData.hours}</td>
    <td>${props.rowData.hourly}</td>
  </tr>
);

export default class Dashboard extends Component {

  constructor(props) {
    super(props);

    this.state = { 
      userID: props.userID,
      name: '',
      email: '',
      password: '',
      tips: [],
      tipsByMonth: {},
      tipInfo: {
        total: 0,
        totalYear: 0,
        totalMonth: 0,
        average: 0,
        totalHourly: 0
      }
    };
  } 

  componentDidMount() {
    axios.get('http://localhost:5000/auth/userdata?userID=' + this.state.userID)
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

  getTotalsAndHourly(tips) {
    let total = 0;
    tips.forEach(e => total += e.amount);
    let average = total / tips.length;
    average = average.toFixed(2);

    let hours = 0;
    tips.forEach(e => hours += e.shiftLength);
    let hourly = total / hours;
    hourly = hourly.toFixed(2);

    return { total, average, hours, hourly };
  }

  generateTipInfo() {
    
    let totalYear = 0;
    let totalMonth = 0;
    
    const { total, average, hourly } = this.getTotalsAndHourly(this.state.tips);

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

    const tipsByMonth = {};
    for (let i = 1; i <= 12; i++) {
      const filteredArr = this.state.tips.filter(e => moment(e.date).format('M') === i.toString());
      if (filteredArr.length) {
        tipsByMonth[moment(filteredArr[0].date).format('MMMM')] = this.getTotalsAndHourly(filteredArr);
      }
    }

    const tipsByWeek = {};
    for (let i = 0; i < 7; i++) {
      const filteredArr = this.state.tips.filter(e => new Date(e.date).getDay() === i);
      if (filteredArr.length) {
        tipsByWeek[moment(filteredArr[0].date).format('dddd')] = this.getTotalsAndHourly(filteredArr);
      }
    }

    this.setState({
      tipInfo: {
        total,
        totalYear,
        totalMonth,
        average,
        hourly
      },
      tipsByMonth,
      tipsByWeek
    });
  }

  tipList(tipsObject) {
    const tipList = [];
    for (const key in tipsObject) {
      if (tipsObject.hasOwnProperty(key)) {
        const monthData = tipsObject[key];
        tipList.push(<Row name={key} rowData={monthData} key={key} />);
      }
    }
    return tipList;
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
          <h3>Tip Data By</h3>
          <table className="table" id="byMonth">
            <thead className="thead-light">
              <tr>
                <th>Month</th>
                <th>Tips</th>
                <th>Hours</th>
                <th>$/Hour</th>
              </tr>
            </thead>
            <tbody>
              {this.tipList(this.state.tipsByMonth)}
            </tbody>
          </table>
          <table className="table" id="byWeek">
            <thead className="thead-light">
              <tr>
                <th>Weekday</th>
                <th>Tips</th>
                <th>Hours</th>
                <th>$/Hour</th>
              </tr>
            </thead>
            <tbody>
              {this.tipList(this.state.tipsByWeek)}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}