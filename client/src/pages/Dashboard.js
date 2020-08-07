import React, { Component, Fragment } from 'react';
import axios from 'axios';
import moment from 'moment';

import Table from '../components/Table';
import ErrorModal from '../components/ErrorModal';
import Loader from '../components/Loader';
import getSafe from '../utils/getSafe';


export default class Dashboard extends Component {

  state = { 
    token: this.props.token,
    name: '',
    shiftTypes: [],
    positions: [],
    tipData: {
      tipsArr: []
    },
    tipDataByPosition: {},
    tipDataByShiftType: {},
    tipDataByMonth: {},
    tipDataByDay: {},
    tipDataCurrYear: {},
    error: null,
    dataLoading: true
  };
  

  componentDidMount() {
    axios.get('/auth/userdatatips', { 
      headers: {
        Authorization: 'Bearer ' + this.state.token
      }
    })
      .then(response => {
        console.log(response.data.message);
        const user = response.data.user;
        this.setState({
          name: user.name
        });
        
        if (!user.tips.length) {
          return this.setState({ dataLoading: false });
        }
        const tipData = { tipsArr: user.tips };
        const tipDataByPosition = {};
        const tipDataByShiftType = {};
        const tipDataByMonth = {};
        const tipDataByDay = {};
        const tipDataCurrYear = { tipsArr: [] };

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

          const weekday = moment(tip.date).format('dddd');
          createTipArrayAndPush(tipDataByDay, weekday, tip);

          const month = moment(tip.date).format('MMMM');
          createTipArrayAndPush(tipDataByMonth, month, tip);

          if (new Date().getFullYear() === new Date(tip.date).getFullYear()) {
            tipDataCurrYear.tipsArr.push(tip);
            addToTotalAndHours(tipDataCurrYear, tip);
          }
        }

        tipData.totals.average = '$' + (tipData.totals.total / tipData.tipsArr.length).toFixed(2);  
        this.generateTipTotals(tipData);
        this.generateTipTotals(tipDataByPosition);
        this.generateTipTotals(tipDataByShiftType);
        this.generateTipTotals(tipDataByMonth);
        this.generateTipTotals(tipDataByDay);
        this.generateTipTotals(tipDataCurrYear);
        
        console.log(tipData);
        this.setState({
          positions: user.positions,
          shiftTypes: user.shiftTypes,
          tipData,
          tipDataByPosition,
          tipDataByShiftType,
          tipDataByMonth,
          tipDataByDay,
          tipDataCurrYear,
          dataLoading: false
        }, () => console.log(this.state.tipData));
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
        if (key === 'totals' && object.tipsArr.length) {
          element.hourly = '$' + (element.total / element.hours).toFixed(2);
          element.total = '$' + element.total.toFixed(2);
          element.hours = element.hours.toFixed(1);
        } else if (typeof element === 'object') {
          this.generateTipTotals(element);
        } 
      }
    }
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  render() {
    let loadedHtml;
    if (!this.state.tipData.tipsArr.length) {
      loadedHtml = (<p>You have no tips currently!</p>);
    } else {
      const headers = ['Tips', 'Hours', '$/Hour'];
      loadedHtml = (
        <div className="row">
          <h3 className="padded">Tip Data By</h3>
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
              <p>Average Tips per Shift: {getSafe(() => this.state.tipData.totals.average, '$0')}</p>
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