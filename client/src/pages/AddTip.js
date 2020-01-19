import React, { Component } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default class AddTip extends Component {
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
      },
      tipAdded: false
    }
  }

  componentDidMount() {
    
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

    axios.post('http://localhost:5000/tips/create', tip)
      .then(res => console.log(res.data.message))
      .catch(err => console.log(err));

      const resetTip = {...this.state.tip};
      resetTip.amount = 0;
      resetTip.shiftLength = 0;
      resetTip.date = new Date();
      this.setState({
        tip: resetTip,
        tipAdded: true
      });
  }

  render() {
    return (
    <div>
      <h3>Add a Tip</h3>
      {this.state.tipAdded === true && <p className="text-success" >Tip successfully added!</p>}
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
          <input type="submit" value="Add Tip" className="btn btn-primary" />
        </div>
      </form>
    </div>
    )
  }
}