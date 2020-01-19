import React, { Component } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default class EditTip extends Component {
  constructor(props) {
    super(props);

    this.onChangeInput = this.onChangeInput.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      tip: {
        userID: props.userID,
        amount: 0,
        shiftLength: 0,
        date: new Date()
      }
    }
  }

  componentDidMount() {
    axios.get(
        'http://localhost:5000/tips/' + 
        this.props.match.params.id +
        '?userID=' +
        this.state.tip.userID
      )
      .then(response => {
        console.log(response.data.message);
        const tip = {...this.state.tip};
        const responseTip = response.data.tip;
        tip.amount = responseTip.amount;
        tip.shiftLength = responseTip.shiftLength;
        tip.date = new Date(responseTip.date);
        this.setState({ tip }); 
      })
      .catch(err => console.log(err));
  }

  onChangeInput(e) {
    const tip = {...this.state.tip};
    tip[e.target.id] = e.target.value;
    this.setState({tip});
  }

  onSubmit(e) {
    e.preventDefault();

    const tip = this.state.tip;

    console.log(tip);

    axios.put('http://localhost:5000/tips/' + this.props.match.params.id, tip)
      .then(res => {
        console.log(res.data);
        this.props.history.replace('/');
      })
      .catch(err => console.log(err));
  }

  render() {
    return (
    <div>
      <h3>Edit Tip</h3>
      <form onSubmit={this.onSubmit}>
        <div className="form-group">
          <label>Date: </label>
          <div>
            <DatePicker
              selected={this.state.tip.date}
              onChange={date => {
                const tip = {...this.state.tip};
                tip.date = date;
                this.setState({tip});
              }}
            />
          </div>
        </div>
        <div className="form-group"> 
          <label>Amount: </label>
          <input  type="text"
              required
              className="form-control"
              id="amount"
              value={this.state.tip.amount}
              onChange={e => this.onChangeInput(e)}
              />
        </div>
        <div className="form-group">
          <label>Shift Length (in hours): </label>
          <input 
              type="text" 
              className="form-control"
              id="shiftLength"
              value={this.state.tip.shiftLength}
              onChange={e => this.onChangeInput(e)}
              />
        </div>
        

        <div className="form-group">
          <input type="submit" value="Update Tip" className="btn btn-primary" />
        </div>
      </form>
    </div>
    )
  }
}