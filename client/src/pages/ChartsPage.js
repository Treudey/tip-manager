import React, { Component, Fragment } from 'react';
import { Chart } from "react-google-charts";
import { Row, Col } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';

import ErrorModal from '../components/ErrorModal';
import Loader from '../components/Loader';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default class ChartsPage extends Component {

  state = { 
    token: this.props.token,
    shiftTypes: [],
    positions: [],
    tipData: {
      tipsArr: []
    },
    tipDataByPosition: {},
    tipDataByShiftType: {},
    tipDataByMonth: {},
    tipDataByDay: {},
    error: null,
    chartsLoading: true
  };
  
  componentDidMount() {
    axios.get('http://localhost:5000/auth/userdatatips', { 
      headers: {
        Authorization: 'Bearer ' + this.state.token
      }
    })
      .then(response => {
        console.log(response.data.message);
        const user = response.data.user;

        if (!user.tips.length) {
          return this.setState({ chartsLoading: false });
        }
        
        const tipData = { tipsArr: user.tips };
        const tipDataByPosition = {};
        const tipDataByShiftType = {};
        const tipDataByMonth = {};
        const tipDataByDay = {};

        const addToTotalAndHours = (obj, tip) => {
          obj.totals = obj.totals || {};
          obj.totals.total = obj.totals.total || 0;
          obj.totals.total += tip.amount;
          obj.totals.hours = obj.totals.hours || 0;
          obj.totals.hours += tip.shiftLength;
        };

        const createTipArrayAndPush = (obj, key, tip) => {
          obj[key] = obj[key] || {};
          obj[key].tipsArr = obj[key].tipsArr || [];
          obj[key].tipsArr.push(tip);
          addToTotalAndHours(obj[key], tip);
        };

        for (const tip of user.tips) {
          addToTotalAndHours(tipData, tip);

          createTipArrayAndPush(tipDataByPosition, tip.position, tip);

          createTipArrayAndPush(tipDataByShiftType, tip.shiftType, tip);

          createTipArrayAndPush(tipDataByPosition[tip.position], tip.shiftType, tip);

          const weekday = moment(tip.date).format('dddd');
          createTipArrayAndPush(tipDataByDay, weekday, tip);
          createTipArrayAndPush(tipDataByDay[weekday], tip.shiftType, tip);

          createTipArrayAndPush(tipDataByPosition[tip.position], weekday, tip);
          createTipArrayAndPush(tipDataByPosition[tip.position][weekday], tip.shiftType, tip);

          const month = moment(tip.date).format('MMMM');
          createTipArrayAndPush(tipDataByMonth, month, tip);

          createTipArrayAndPush(tipDataByPosition[tip.position], month, tip);
        }

        console.log(tipDataByPosition)
        this.generateTipTotals(tipData);
        this.generateTipTotals(tipDataByPosition);
        this.generateTipTotals(tipDataByShiftType);
        this.generateTipTotals(tipDataByMonth);
        this.generateTipTotals(tipDataByDay);

        
        this.setState({
          positions: user.positions,
          shiftTypes: user.shiftTypes,
          tipData,
          tipDataByPosition,
          tipDataByShiftType,
          tipDataByMonth,
          tipDataByDay,
          chartsLoading: false
        }, () => console.log(this.state));
      })
      .catch(err => {
        console.log(err);
        err = new Error('Failed to load tip data.');
        this.setState({ error: err });
      });
  }

  generateTipTotals = (object) => {
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        const element = object[key];
        if (key === 'totals' && object.tipsArr.length) {
          Object.assign(element, this.getAverageAndHourly(element, object.tipsArr.length));
        } else if (typeof element === 'object') {
          this.generateTipTotals(element);
        } 
      }
    }
  };
  
  getAverageAndHourly = (totalsObj, tipsCount) => {
    let average = totalsObj.total / tipsCount;
    average = +average.toFixed(2);

    let hourly = totalsObj.total / totalsObj.hours;
    hourly = +hourly.toFixed(2);

    return { average, hourly };
  };

  getFormattedArrBar = (fieldArr, obj, info, dataType) => {
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
  };
  
  getFormattedArrPie = (fieldArr, obj, dataType) => {
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
    return filterdDataArr;
  };

  getFormattedArrLine = (arr, rowType, position) => {
    const dataArr = [];
  
    if (arr) {
      arr.forEach((tip, index) => {
        if (rowType === 'date') {
          dataArr.push([new Date(tip.date), tip.amount]);
        } else {
          dataArr.push([index + 1, tip.amount])
        }
      });
  
      const column0 = (rowType === 'date') ? { type: 'date', label: 'Date' } : rowType;
      dataArr.unshift([
        column0,
        position || 'Tips',
      ]);
    }
    
    return dataArr;
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  render() {

    let loadedHtml;
    if (!this.state.tipData.tipsArr.length) {
      loadedHtml = (<h2>You have no tips currently!</h2>);
    } else {
      loadedHtml = (
        <Fragment>
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
                data={this.getFormattedArrBar(days, this.state.tipDataByDay, 'average', 'ShiftType')}
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
            {this.state.positions.length > 1 && 
              this.state.positions.map(position => {
                return (
                  <Col key={position + 'AverageTips'}>
                    <Chart
                      width={'100%'}
                      height={'500px'}
                      chartType="ColumnChart"
                      loader={<div>Loading Chart</div>}
                      data={this.getFormattedArrBar(days, this.state.tipDataByPosition[position], 'average', 'ShiftType')}
                      options={{
                        title: 'Average Tips by Weekday for ' + position,
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
                )
              })
            }
          </Row>
          <Row>
            {this.state.positions.length > 1 && 
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
            }
            <Col>
              <Chart
                width={'100%'}
                height={'500px'}
                chartType="PieChart"
                loader={<div>Loading Chart</div>}
                data={this.getFormattedArrPie(months, this.state.tipDataByMonth, 'Month')}
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
                data={this.getFormattedArrPie(days, this.state.tipDataByDay, 'Day')}
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
                height={'500px'}
                chartType="LineChart"
                loader={<div>Loading Chart</div>}
                data={this.getFormattedArrLine(this.state.tipData.tipsArr, 'date')}
                options={{
                  title: 'Tips Earned by Date',
                  hAxis: {
                    title: 'Date'
                  },
                  vAxis: {
                    title: 'Tips'
                  },
                  pointsVisible: true	
                }}
              />
            </Col>
          </Row>
          {this.state.positions.length > 1 && 
              this.state.positions.map(position => {
                return (
                  <Row key={position + 'TipsOverTime'}>
                  <Col>
                    <Chart
                      width={'100%'}
                      height={'500px'}
                      chartType="LineChart"
                      loader={<div>Loading Chart</div>}
                      data={this.getFormattedArrLine(this.state.tipDataByPosition[position].tipsArr, 'date', position)}
                      options={{
                        title: `Tips Earned for ${position} by Date`,
                        hAxis: {
                          title: 'Date'
                        },
                        vAxis: {
                          title: 'Tips'
                        },
                        pointsVisible: true	
                      }}
                    />
                  </Col>
                  </Row>
                )
              })
          }
        </Fragment>
      );
    }

    return (
      <div className="container-fluid">
        <ErrorModal error={this.state.error} onHandle={this.errorHandler} />
        <Row>
          <h1>Chart Page</h1>
        </Row>
        {this.state.chartsLoading ? (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Loader />
          </div>
        ) : loadedHtml}
      </div>
    );
  }
}