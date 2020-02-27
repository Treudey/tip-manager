import React, { Component, Fragment } from 'react';
import axios from 'axios';
import moment from 'moment';

import Table from '../components/Table';
import ErrorModal from '../components/ErrorModal';
import Loader from '../components/Loader';

const getSafe = (fn, defaultVal) => {
  try {
    return fn();
  } catch (e) {
    return defaultVal;
  }
}
export default class Dashboard extends Component {

  state = { 
    token: this.props.token,
    name: '',
    email: '',
    shiftTypes: [],
    positions: [],
    tipData: {},
    tipDataByPosition: {},
    tipDataByShiftType: {},
    tipDataByMonth: {},
    tipDataByDay: {},
    tipDataCurrYear: {},
    error: null,
    dataLoading: true
  };
  

  componentDidMount() {
    axios.get('http://localhost:5000/auth/userdata', { 
      headers: {
        Authorization: 'Bearer ' + this.state.token
      }
    })
      .then(response => {
        console.log(response.data.message);
        const user = response.data.user;
        this.setState({
          name: user.name,
          email: user.email,
          password: user.password,
        });
        
        if (!user.tips.length) {
          return;
        }

        const tipDataByPosition = {};
        const tipDataByShiftType = {};
        const tipDataByMonth = {};
        const tipDataByDay = {};
        const tipDataCurrYear = { tipsArr: [] };

        const createTipArrayAndPush = (obj, key, tip) => {
          obj[key] = obj[key] || {};
          obj[key].tipsArr = obj[key].tipsArr || [];
          obj[key].tipsArr.push(tip);
        };

        for (const tip of user.tips) {
          createTipArrayAndPush(tipDataByPosition, tip.position, tip);
          createTipArrayAndPush(tipDataByShiftType, tip.shiftType, tip);

          const weekday = moment(tip.date).format('dddd');
          createTipArrayAndPush(tipDataByDay, weekday, tip);

          const month = moment(tip.date).format('MMMM');
          createTipArrayAndPush(tipDataByMonth, month, tip);

          if (new Date().getFullYear() === new Date(tip.date).getFullYear()) {
            tipDataCurrYear.tipsArr.push(tip);
          }
        }

        this.generateTipTotals(tipDataByPosition);
        this.generateTipTotals(tipDataByShiftType);
        this.generateTipTotals(tipDataByMonth);
        this.generateTipTotals(tipDataByDay);
        this.generateTipTotals(tipDataCurrYear);
        const tipTotals = this.getTotalsAndHourly(user.tips);

        this.setState({
          positions: user.positions,
          shiftTypes: user.shiftTypes,
          tipData: {
            tipsArr: user.tips,
            totals: {
              ...tipTotals,
              average: '$' + (+tipTotals.total.replace('$', '') / user.tips.length).toFixed(2)
            }
          },
          tipDataByPosition,
          tipDataByShiftType,
          tipDataByMonth,
          tipDataByDay,
          tipDataCurrYear,
          dataLoading: false
        });
      })
      .catch(err => {
        console.log(err);
        err = new Error('Failed to load user data.');
        this.setState({ error: err });
      });
  }

  generateTipTotals = (object) => {
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

  getTotalsAndHourly = (tips) => {
    let total = 0;
    tips.forEach(e => total += e.amount);

    let hours = 0;
    tips.forEach(e => hours += e.shiftLength);
    let hourly = total / hours;
    hourly = '$' + hourly.toFixed(2);

    return { total: '$' + total.toFixed(2), hours, hourly };
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  render() {
    console.log(this.state);
    let loadedHtml;
    if (!this.state.tipData.tipsArr) {
      loadedHtml = (<p>You have no tips currently!</p>);
    } else {
      const headers = ['Tips', 'Hours', '$/Hour'];
      loadedHtml = (
        <div className="row">
          <h3>Tip Data By</h3>
          <Table headers={['Position', ...headers]} rowData={this.state.tipDataByPosition} />
          <Table headers={['Type of Shift', ...headers]} rowData={this.state.tipDataByShiftType} />
          <Table headers={['Month', ...headers]} rowData={this.state.tipDataByMonth} />
          <Table headers={['Weekday', ...headers]} rowData={this.state.tipDataByDay} />
        </div>
      );
    }
    
    return (
      <div className="container-fluid">
        <ErrorModal error={this.state.error} onHandle={this.errorHandler} />
        <div className="row jumbotron text-center">
          <div className="col-12">
            <h1 className="display-2">Welcome {this.state.name}</h1>
          </div>
          <div className="col-12">
            <Fragment>
              <p>Total Tips Made: {getSafe(() => this.state.tipData.totals.total, '$0')}</p>
              <p>Tips Made This Year: {getSafe(() => this.state.tipDataCurrYear.totals.total, '$0')}</p>
              <p>Tips Made This Month: {getSafe(() => this.state.tipDataByMonth[moment().format('MMMM')].totals.total, '$0')}</p>
              <p>Average Tips per Shift: {getSafe(() => this.state.tipData.totals.average, 0)}</p>
              <p>Hourly: {getSafe(() => this.state.tipData.totals.hourly, '$0')}/hr</p>
            </Fragment>
          </div>
        </div>
        {this.state.dataLoading ? (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Loader />
          </div>
        ) : loadedHtml}
      </div>
    );
  }
}