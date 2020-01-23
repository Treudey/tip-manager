import React, { Component, Fragment } from 'react';
import { Chart } from "react-google-charts";
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';

export default class ChartsPage extends Component {

  constructor(props) {
    super(props);

    this.state = { 
      userID: props.userID,
      shiftTypes: [],
      positions: [],
      tips: [],
      tipDataByPosition: {},
      tipDataByShiftType: {},
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
    let tipData = {};
    for (const item of arr) {
      const filteredArr = this.state.tips.filter(e => e[property] === item);
      if (filteredArr.length) {
        const {total, hours, hourly} = this.getTotalsAndHourly(filteredArr);
        tipData[item] = {};
        tipData[item].tipsArr = filteredArr;
        tipData[item].totals = { name: item, total, hours, hourly };
        tipData[item].tipsByMonth = this.getTipDataByMonth(filteredArr);
        tipData[item].tipsByDay = this.getTipDataByDay(filteredArr);
      }
    }
    return tipData;
  }
  
  getTipDataByMonth(arr) {
    const tipsByMonth = [];
    for (let i = 1; i <= 12; i++) {
      const filteredArr = arr.filter(e => moment(e.date).format('M') === i.toString());
      if (filteredArr.length) {
        const {total, hours, hourly} = this.getTotalsAndHourly(filteredArr);
        tipsByMonth.push({
          name: moment(filteredArr[0].date).format('MMMM'), 
          total, 
          hours, 
          hourly
        });
      }
    }
    return tipsByMonth;
  }

  getTipDataByDay(arr) {
    const tipsByDay = [];
    for (let i = 0; i < 7; i++) {
      const filteredArr = arr.filter(e => new Date(e.date).getDay() === i);
      if (filteredArr.length) {
        const {total, hours, hourly} = this.getTotalsAndHourly(filteredArr);
        tipsByDay.push({
          name: moment(filteredArr[0].date).format('dddd'),
          total, 
          hours, 
          hourly
        });
      }
    }
    return tipsByDay;
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

    const tipsByMonth = this.getTipDataByMonth(this.state.tips);
    const tipsByDay = this.getTipDataByDay(this.state.tips);

    const tipDataByPosition = this.getTipDataBy(this.state.positions, 'position');
    const tipDataByShiftType = this.getTipDataBy(this.state.shiftTypes, 'shiftType');
    

    this.setState({
      tipInfo: {
        total,
        totalYear,
        totalMonth,
        average,
        hourly
      },
      tipDataByPosition,
      tipDataByShiftType,
      tipsByMonth,
      tipsByDay
    });
  }

  getDataArrBy(arr, type) {
    const dataArr = [];
    for (const key in this.state.tipDataByPosition) {
      if (this.state.tipDataByPosition.hasOwnProperty(key)) {
        const positionData = this.state.tipDataByPosition[key];
        positionData['tipsBy' + type].forEach((info) => {
          const index = arr.indexOf(info.name);
          if (!dataArr[index]) {
            dataArr[index] = [];
          }
          dataArr[index][0] = info.name; 
          dataArr[index].push(info.hourly);
        });
        
      }
    }
    const filterdDataArr = dataArr.filter(e => e.length > 0);
    filterdDataArr.forEach(arr => {
      while (arr.length < (this.state.positions.length + 1)) {
        arr.push(0);
      } 
    });
    filterdDataArr.unshift(['Position', ...this.state.positions]);
    console.log(filterdDataArr);
    return filterdDataArr
  }

  render() {
    console.log(this.state);
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dataArrByDay = this.getDataArrBy(days, 'Day');
    const dataArrByMonth = this.getDataArrBy(months, 'Month');
    
    

    return (
      <Container fluid>
        <Row>
          <h1>Chart Page</h1>
        </Row>
        <Row>
          <Col>
            <Chart
              width={'100%'}
              height={'500px'}
              chartType="ColumnChart"
              loader={<div>Loading Chart</div>}
              data={dataArrByDay}
              options={{
                title: 'Hourly Tips by Weekday',
                chartArea: { width: '50%' },
                vAxis: {
                  title: '$/Hour',
                  minValue: 0,
                },
                hAxis: {
                  title: 'Weekday',
                },
              }}
            />
          </Col>
          <Col>
            <Chart
              width={'100%'}
              height={'700px'}
              chartType="ColumnChart"
              loader={<div>Loading Chart</div>}
              data={dataArrByMonth}
              options={{
                title: 'Hourly Tips by Month',
                chartArea: { width: '50%' },
                vAxis: {
                  title: '$/Hour',
                  minValue: 0,
                },
                hAxis: {
                  title: 'Month',
                },
              }}
            />
          </Col>
        </Row>
        
      </Container>
    );
  }
}