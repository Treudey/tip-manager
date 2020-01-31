import React, { Component } from 'react';
import { Chart } from "react-google-charts";
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default class ChartsPage extends Component {

  constructor(props) {
    super(props);

    this.state = { 
      userID: props.userID,
      shiftTypes: [],
      positions: [],
      tipData: {},
      tipDataByPosition: {},
      tipDataByShiftType: {},
      tipsByMonth: {},
      tipsByDay: {}
    };
  } 

  componentDidMount() {
    axios.get('http://localhost:5000/auth/userdata?userID=' + this.state.userID)
      .then(response => {
        console.log(response.data.message);
        const user = response.data.user;
        const tipDataByPosition = {};
        const tipDataByShiftType = {};
        const tipsByMonth = {};
        const tipsByDay = {};

        const createTipArrayAndPush = (obj, key, tip) => {
          obj[key] = obj[key] || {};
          obj[key].tipsArr = obj[key].tipsArr || [];
          obj[key].tipsArr.push(tip);
        };

        for (const tip of user.tips) {

          createTipArrayAndPush(tipDataByPosition, tip.position, tip);

          createTipArrayAndPush(tipDataByShiftType, tip.shiftType, tip);

          createTipArrayAndPush(tipDataByPosition[tip.position], tip.shiftType, tip);

          const weekday = moment(tip.date).format('dddd');
          createTipArrayAndPush(tipsByDay, weekday, tip);
          createTipArrayAndPush(tipsByDay[weekday], tip.shiftType, tip);

          createTipArrayAndPush(tipDataByPosition[tip.position], weekday, tip);
          createTipArrayAndPush(tipDataByPosition[tip.position][weekday], tip.shiftType, tip);

          const month = moment(tip.date).format('MMMM');
          createTipArrayAndPush(tipsByMonth, month, tip);

          createTipArrayAndPush(tipDataByPosition[tip.position], month, tip);
        }

        this.generateTipTotals(tipDataByPosition);
        this.generateTipTotals(tipDataByShiftType);
        this.generateTipTotals(tipsByMonth);
        this.generateTipTotals(tipsByDay);

        console.log(tipDataByPosition);
        console.log(tipDataByShiftType);
        console.log(tipsByMonth);
        console.log(tipsByDay);
        
        this.setState({
          positions: user.positions,
          shiftTypes: user.shiftTypes,
          tipData: {
            tipsArr: user.tips,
            totals: this.getTotalsAndHourly(user.tips)
          },
          tipDataByPosition,
          tipDataByShiftType,
          tipsByMonth,
          tipsByDay,
        });
      })
      .catch(err => console.log(err));
  }

  generateTipTotals(object) {
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        const element = object[key];
        if (Array.isArray(element) && element.length) {
          object.totals = this.getTotalsAndHourly(element);
        } else if (typeof element === 'object') {
          this.generateTipTotals(element);
        } 
      }
    }
  };
  
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

  getFormattedArrBar(fieldArr, obj, info, dataType) {
    const arrayName = dataType.replace(dataType.charAt(0), dataType.charAt(0).toLowerCase()) + 's';
    const dataArr = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const positionData = obj[key];
        Object.keys(positionData).forEach(positionDataKey => {
          if (fieldArr.includes(positionDataKey)) {
            const index = fieldArr.indexOf(positionDataKey);
            dataArr[index] = dataArr[index] || [];
            dataArr[index][0] = positionDataKey; 
            dataArr[index][this.state[arrayName].indexOf(key) + 1] = positionData[positionDataKey].totals[info];
          } else if (this.state[arrayName].includes(positionDataKey)) {
            const index = fieldArr.indexOf(key);
            dataArr[index] = dataArr[index] || [];
            dataArr[index][0] = key; 
            dataArr[index][this.state[arrayName].indexOf(positionDataKey) + 1] = positionData[positionDataKey].totals[info];
          }
        });
      }
    }

    const filterdDataArr = dataArr.filter(e => e.length > 0);
    filterdDataArr.forEach(arr => {
      for (let i = 1; i < this.state[arrayName].length + 1; i++) {
        arr[i] = arr[i] || 0;
      }
    });
    filterdDataArr.unshift([dataType, ...this.state[arrayName]]);
    return filterdDataArr;
  }

  
  getFormattedArrPie(fieldArr, obj, dataType) {
    const dataArr = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (fieldArr.includes(key)) {
          const element = obj[key];
          const index = fieldArr.indexOf(key);
          dataArr[index] = dataArr[index] || [];
          dataArr[index][0] = key;
          dataArr[index].push(element.totals.total);
        }
      }
    }

    const filterdDataArr = dataArr.filter(e => e.length > 0);
    filterdDataArr.unshift([dataType, 'Tips']);
    console.log(filterdDataArr);
    return filterdDataArr;
  };

  render() {
    console.log(this.state);
    const dataArrByDayAndShiftTypeInseat = this.getFormattedArrBar(days, this.state.tipDataByPosition.Inseat, 'average', 'ShiftType');
    const dataArrByDayAndShiftTypeBartender = this.getFormattedArrBar(days, this.state.tipDataByPosition.Bartender, 'average', 'ShiftType');

    const dataArr = [];
  
    if (this.state.tipData.tipsArr) {
      
      this.state.tipData.tipsArr.forEach(tip => {
        dataArr.push([new Date(tip.date), tip.amount]);
      });

      dataArr.unshift([
        { type: 'date', label: 'Shift' },
        'Tips',
      ]);
    }
    
    


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
              data={this.getFormattedArrBar(days, this.state.tipDataByPosition, 'hourly', 'Position')}
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
              height={'500px'}
              chartType="ColumnChart"
              loader={<div>Loading Chart</div>}
              data={this.getFormattedArrBar(months, this.state.tipDataByPosition, 'hourly', 'Position')}
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
        <Row>
          <Col>
            <Chart
              width={'100%'}
              height={'500px'}
              chartType="ColumnChart"
              loader={<div>Loading Chart</div>}
              data={this.getFormattedArrBar(this.state.shiftTypes, this.state.tipDataByPosition, 'average', 'Position')}
              options={{
                title: 'Average Tips by Type of Shift',
                chartArea: { width: '50%' },
                vAxis: {
                  title: 'Dollars',
                  minValue: 0,
                },
                hAxis: {
                  title: 'Type of Shift',
                },
              }}
            />
          </Col>
          <Col>
            <Chart
              width={'100%'}
              height={'500px'}
              chartType="ColumnChart"
              loader={<div>Loading Chart</div>}
              data={this.getFormattedArrBar(days, this.state.tipsByDay, 'average', 'ShiftType')}
              options={{
                title: 'Average Tips by Weekday for all Positions',
                chartArea: { width: '50%' },
                vAxis: {
                  title: 'Dollars',
                  minValue: 0,
                },
                hAxis: {
                  title: 'Weekday',
                },
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <Chart
              width={'100%'}
              height={'500px'}
              chartType="ColumnChart"
              loader={<div>Loading Chart</div>}
              data={dataArrByDayAndShiftTypeInseat}
              options={{
                title: 'Average Tips by Weekday for Inseat',
                chartArea: { width: '50%' },
                vAxis: {
                  title: 'Dollars',
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
              height={'500px'}
              chartType="ColumnChart"
              loader={<div>Loading Chart</div>}
              data={dataArrByDayAndShiftTypeBartender}
              options={{
                title: 'Average Tips by Weekday for Bartender',
                chartArea: { width: '50%' },
                vAxis: {
                  title: 'Dollars',
                  minValue: 0,
                },
                hAxis: {
                  title: 'Weekday',
                },
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <Chart
              width={'100%'}
              height={'500px'}
              chartType="PieChart"
              loader={<div>Loading Chart</div>}
              data={this.getFormattedArrPie(this.state.positions, this.state.tipDataByPosition, 'Position')}
              options={{
                title: 'Percentage of Tips Earned by Position',
                is3D: true
              }}
            />
          </Col>
          <Col>
            <Chart
              width={'100%'}
              height={'500px'}
              chartType="PieChart"
              loader={<div>Loading Chart</div>}
              data={this.getFormattedArrPie(months, this.state.tipsByMonth, 'Month')}
              options={{
                title: 'Percentage of Tips Earned by Month',
                is3D: true
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <Chart
              width={'100%'}
              height={'500px'}
              chartType="PieChart"
              loader={<div>Loading Chart</div>}
              data={this.getFormattedArrPie(days, this.state.tipsByDay, 'Day')}
              options={{
                title: 'Percentage of Tips Earned by Day',
                is3D: true
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <Chart
              width={'100%'}
              height={'700px'}
              chartType="LineChart"
              loader={<div>Loading Chart</div>}
              data={dataArr}
              options={{
                title: 'Percentage of Tips Earned by Day',
                hAxis: {
                  title: 'Shift Date'
                },
                vAxis: {
                  title: 'Tips'
                },
                pointsVisible: true	
              }}
            />
          </Col>
        </Row>
      </Container>
    );
  }
}