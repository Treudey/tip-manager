import React, { Component, Fragment } from 'react';
import axios from 'axios';
import moment from 'moment';

import Table from '../components/Table'

export default class Dashboard extends Component {

  constructor(props) {
    super(props);

    this.state = { 
      userID: props.userID,
      name: '',
      email: '',
      password: '',
      shiftTypes: [],
      positions: [],
      tips: [],
      tipsByPosition: [],
      tipsByShiftType: [],
      tipsByMonth: [],
      tipsByDay: [],
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
          positions: user.positions,
          shiftTypes: user.shiftTypes,
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
    average = +average.toFixed(2);

    let hours = 0;
    tips.forEach(e => hours += e.shiftLength);
    let hourly = total / hours;
    hourly = +hourly.toFixed(2);

    return { total, average, hours, hourly };
  }

  getTipDataBy(arr, property) {
    const newTipDataArr = [];
    for (const item of arr) {
      const filteredArr = this.state.tips.filter(e => e[property] === item);
      if (filteredArr.length) {
        const {total, hours, hourly} = this.getTotalsAndHourly(filteredArr);
        newTipDataArr.push({
          name: item, 
          total: '$' + total, 
          hours, 
          hourly: '$' + hourly 
        });
      }
    }
    return newTipDataArr;
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

    const tipsByPosition = this.getTipDataBy(this.state.positions, 'position');
    const tipsByShiftType = this.getTipDataBy(this.state.shiftTypes, 'shiftType');

    const tipsByMonth = [];
    for (let i = 1; i <= 12; i++) {
      const filteredArr = this.state.tips.filter(e => moment(e.date).format('M') === i.toString());
      if (filteredArr.length) {
        const {total, hours, hourly} = this.getTotalsAndHourly(filteredArr);
        tipsByMonth.push({
          name: moment(filteredArr[0].date).format('MMMM'), 
          total: '$' + total, 
          hours, 
          hourly: '$' + hourly
        });
      }
    }

    const tipsByDay = [];
    for (let i = 0; i < 7; i++) {
      const filteredArr = this.state.tips.filter(e => new Date(e.date).getDay() === i);
      if (filteredArr.length) {
        const {total, hours, hourly} = this.getTotalsAndHourly(filteredArr);
        tipsByDay.push({
          name: moment(filteredArr[0].date).format('dddd'),
           total: '$' + total, 
           hours, 
           hourly: '$' + hourly
          });
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
      tipsByPosition,
      tipsByShiftType,
      tipsByMonth,
      tipsByDay
    });
  }

  render() {
    console.log(this.state);
    let tipListData;
    if (!this.state.tips.length) {
      tipListData = (<p>You have no tips currently!</p>);
    } else {
      const headers = ['Tips', 'Hours', '$/Hour'];
      tipListData = (
        <Fragment>
          <h3>Tip Data By</h3>
          <Table headers={['Position', ...headers]} rowList={this.state.tipsByPosition} />
          <Table headers={['Type of Shift', ...headers]} rowList={this.state.tipsByShiftType} />
          <Table headers={['Month', ...headers]} rowList={this.state.tipsByMonth} />
          <Table headers={['Weekday', ...headers]} rowList={this.state.tipsByDay} />
        </Fragment>
      );
    }
    
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
          {tipListData}
        </div>
      </div>
    );
  }
}