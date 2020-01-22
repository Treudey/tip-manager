import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default class EditTip extends Component {
  constructor(props) {
    super(props);

    this.onChangeInput = this.onChangeInput.bind(this);
    this.onSubmitTipForm = this.onSubmitTipForm.bind(this);
    this.onSubmitNewInput = this.onSubmitNewInput.bind(this);

    this.state = {
      tip: {
        userID: props.userID,
        amount: 0,
        position: '',
        shiftType: '',
        shiftLength: 0,
        date: new Date()
      },
      newPosition: '',
      newShiftType: '',
      positionOptions: [],
      shiftTypeOptions: [],
      showPositionModal: false,
      showShiftTypeModal: false
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
        tip.position = responseTip.position;
        tip.shiftType = responseTip.shiftType;
        tip.shiftLength = responseTip.shiftLength;
        tip.date = new Date(responseTip.date);
        this.setState({ tip }); 
        return axios.get('http://localhost:5000/auth/userlists?userID=' + this.state.tip.userID);
      })
      .then(response => {
        console.log(response.data.message);
        this.setState({ 
          positionOptions: [...response.data.positions, 'New'],
          shiftTypeOptions: [...response.data.shiftTypes, 'New']
        });
      })
      .catch(err => console.log(err));
  }

  onChangeInput(e) {
    if (this.state.hasOwnProperty(e.target.id)) {
      this.setState({[e.target.id]: e.target.value});
    }

    const tip = {...this.state.tip};
    if (e.target.value === 'New' && e.target.id === 'position') {
      tip.position = this.state.positionOptions[0];
      return this.setState(
        {tip, showPositionModal: true},
        ()=>{
          setTimeout(()=>{this.testInput && this.testInput.focus()}, 1);
        }
        );
    }
    if (e.target.value === 'New' && e.target.id === 'shiftType') {
      tip.shiftType = this.state.shiftTypeOptions[0];
      return this.setState(
        {tip, showShiftTypeModal: true},
        ()=>{
          setTimeout(()=>{this.testInput && this.testInput.focus()}, 1);
        }
        );
    }

    tip[e.target.id] = e.target.value;
    this.setState({tip});
  }

  onSubmitTipForm(e) {
    e.preventDefault();

    const tip = this.state.tip;

    axios.put('http://localhost:5000/tips/' + this.props.match.params.id, tip)
      .then(res => {
        console.log(res.data.message);
        this.props.history.replace('/alltips');
      })
      .catch(err => console.log(err));
  }

  onSubmitNewInput(input) {
    
    const tip = {...this.state.tip};
    tip[input] = this.state['new' + input.replace(input.charAt(0), input.charAt(0).toUpperCase())];

    this.setState({
      tip,
      [input + 'Options']: [tip[input], ...this.state[input + 'Options']],
      showPositionModal: false,
      showShiftTypeModal: false
    });
  }

  options(optionsArr) {
    return optionsArr.map(name => {
      return <option key={name} value={name}>{name}</option>
    });
  }

  render() {
    
    return (
      <div className='container-fluid'>
        <h3>Edit Tip</h3>
        <form onSubmit={this.onSubmitTipForm}>
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
          <label>Position: </label>
          <select
            className="form-control"
            id="position"
            value={this.state.tip.position}
            onChange={e => this.onChangeInput(e)}
          >
            {this.options(this.state.positionOptions)}
          </select>
        </div>
        <div className="form-group">
          <label>Type of Shift: </label>
          <select
            className="form-control"
            id="shiftType"
            value={this.state.tip.shiftType}
            onChange={e => this.onChangeInput(e)}
          >
            {this.options(this.state.shiftTypeOptions)}
          </select>
        </div>
          <div className="form-group">
            <label>Shift Length (in hours): </label>
            <input 
              type="number" 
              className="form-control"
              id="shiftLength"
              value={this.state.tip.shiftLength}
              onChange={e => this.onChangeInput(e)}
            />
          </div>
          <div className="form-group"> 
            <label>Amount: </label>
            <input  
              type="number"
              required
              className="form-control"
              id="amount"
              value={this.state.tip.amount}
              onChange={e => this.onChangeInput(e)}
            />
          </div>
          
          <div className="form-group">
            <input type="submit" value="Update Tip" className="btn btn-primary" />
          </div>
        </form>
        <Modal show={this.state.showPositionModal} onHide={() => this.setState({showPositionModal: false})} >
          <Modal.Header closeButton>
            <Modal.Title>Add a Position</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <label>Position:</label>
            <input 
              type="text" 
              className="form-control" 
              id="newPosition"
              ref={(text) => { this.testInput = text; }} 
              onChange={e => this.onChangeInput(e)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => this.setState({showPositionModal: false})}>
              Close
            </Button>
            <Button variant="primary" onClick={() => this.onSubmitNewInput('position')}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.showShiftTypeModal} onHide={() => this.setState({showShiftTypeModal: false})}>
          <Modal.Header closeButton>
            <Modal.Title>Add a Shift Type</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <label>Type of Shift:</label>
            <input 
              type="text" 
              className="form-control" 
              id="newShiftType"
              ref={(text) => { this.testInput = text; }} 
              onChange={e => this.onChangeInput(e)}
            ></input>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => this.setState({showShiftTypeModal: false})}>
              Close
            </Button>
            <Button variant="primary" onClick={() => this.onSubmitNewInput('shiftType')}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
      )
  }
}