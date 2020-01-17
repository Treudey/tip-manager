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
      },
      tipUpdated: false
    }
  }

  componentDidMount() {
    axios.get(
        'http://localhost:5000/tips/' + 
        this.props.match.params.id +
        '?userID=' +
        this.state.userID
      )
      .then(response => {
        const tip = {...this.state.tip};
        tip.amount = response.data.amount;
        tip.shiftLength = response.data.shiftLength;
        tip.date = new Date(response.data.date);
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
      .then(res => console.log(res.data))
      .catch(err => console.log(err));
  }

  render() {
    return (
    <div>
      <h3>Edit Tip</h3>
      {this.state.tipUpdated === true && <p className="text-success" >Tip successfully updated!</p>}
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