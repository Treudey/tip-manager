import React, { Component, Fragment } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default class TipForm extends Component {
  state = {
    tip: {
      userID: this.props.userID,
      amount: 0,
      position: '',
      shiftType: '',
      shiftLength: 0,
      date: new Date()
    },
    newPosition: '',
    newShiftType: '',
    errors: {
      amount: '',
      shiftLength: '',
      position: '',
      shiftType: '',
      newPosition: '',
      newShiftType: ''
    },
    tipAdded: false,
    positionOptions: [],
    shiftTypeOptions: [],
    showPositionModal: false,
    showShiftTypeModal: false,
    messageTimer: null
  };

  componentDidMount() {
    axios.get('http://localhost:5000/auth/userlists?userID=' + this.state.tip.userID)
      .then(response => {
        console.log(response.data.message);
        const tip = {...this.state.tip};

        if (response.data.positions.length) {
          tip.position = response.data.positions[0];
          tip.shiftType = response.data.shiftTypes[0];
          this.setState({ 
            tip,
            positionOptions: [...response.data.positions, 'New'],
            shiftTypeOptions: [...response.data.shiftTypes, 'New']
          });
        }

        if (this.props.editing) {
          axios.get(
            'http://localhost:5000/tips/' + 
            this.props.tipID +
            '?userID=' +
            this.state.tip.userID
          )
          .then(res => {
            console.log(res.data.message);
            const responseTip = res.data.tip;
            tip.amount = responseTip.amount;
            tip.position = responseTip.position;
            tip.shiftType = responseTip.shiftType;
            tip.shiftLength = responseTip.shiftLength;
            tip.date = new Date(responseTip.date);
            this.setState({ tip }); 
          })
          .catch(err => console.log(err));
        }
      })
      .catch(err => console.log(err));
  }

  componentWillUnmount() {
    clearTimeout(this.state.messageTimer);
  }

  onChangeInput = (e) => {
    const errors = {...this.state.errors};

    if (Object.keys(errors).includes(e.target.id) || this.state.hasOwnProperty(e.target.id)) {
      if (errors[e.target.id] !== '') {
        errors[e.target.id] = '';
        this.setState({ errors });
      }
    }

    if (this.state.hasOwnProperty(e.target.id)) {
      this.setState({[e.target.id]: e.target.value});
    }

    const tip = {...this.state.tip};
    if (e.target.value === 'New' && e.target.id === 'position') {
      tip.position = this.state.positionOptions[0];
      return this.setState(
        {tip, showPositionModal: true},
        ()=>{
          setTimeout(()=>{this.input && this.input.focus()}, 1);
        }
        );
    }
    if (e.target.value === 'New' && e.target.id === 'shiftType') {
      tip.shiftType = this.state.shiftTypeOptions[0];
      return this.setState(
        {tip, showShiftTypeModal: true},
        ()=>{
          setTimeout(()=>{this.input && this.input.focus()}, 1);
        }
        );
    }

    tip[e.target.id] = e.target.value;
    this.setState({tip});
  }

  
  onSubmitTipForm = (e) => {
    e.preventDefault();

    const tip = {...this.state.tip};
    const errors = {...this.state.errors};
    for (const key in tip) {
      if (tip.hasOwnProperty(key)) {
        const value = tip[key];
        switch (key) {
          case 'shiftLength': 
            errors.shiftLength = 
              !(!isNaN(value) && +value > 0 && +value < 1000)
                ? 'The length of the shift must be a valid number between 0 and 1000'
                : '';
            break;
          case 'amount': 
            errors.amount = 
              !(!isNaN(value) && +value > 0 && +value < 1000000)
                ? 'The amount must be a valid number between 0 and 1,000,000'
                : '';
            break;
          case 'position': 
            errors.position = 
            !(value.length > 0 && value.length <= 20)
              ? 'The position must be a between 1 and 20 characters long'
              : '';
            break;
          case 'shiftType': 
            errors.shiftType = 
            !(value.length > 0 && value.length <= 20)
              ? 'The type of shift must be a between 1 and 20 characters long'
              : '';
            break;
          default:
            break;
        }
      }
    }
    console.log(errors);
    if (!this.validateForm(errors)) {
      return this.setState({errors});
    }

    console.log(tip);

    if (this.props.editing) {
      axios.put('http://localhost:5000/tips/' + this.props.tipID, tip)
        .then(res => {
          console.log(res.data.message);
          this.props.history.replace('/alltips');
        })
        .catch(err => console.log(err));

    } else {

      axios.post('http://localhost:5000/tips/create', tip)
      .then(res => { 
        console.log(res.data.message);
        
        tip.amount = 0;
        tip.shiftLength = 0;
        tip.date = new Date();
        this.setState({
          tip,
          tipAdded: true,
          messageTimer: setTimeout(() => this.setState( {tipAdded: false} ), 3000)
        });

        return axios.get('http://localhost:5000/auth/userlists?userID=' + this.state.tip.userID);
      })
      .then(response => {
        console.log(response.data.message);
        
        if (response.data.positions.length) {
          tip.position = response.data.positions[0];
          tip.shiftType = response.data.shiftTypes[0];
          this.setState({
            tip,
            positionOptions: [...response.data.positions, 'New'],
            shiftTypeOptions: [...response.data.shiftTypes, 'New'],
          });
        }
      })
      .catch(err => console.log(err));
    }
  }

  onSubmitNewInput = (inputType) => {
    let newInput = this.state['new' + inputType.replace(inputType.charAt(0), inputType.charAt(0).toUpperCase())];
    const errors =  (({ newShiftType, newPosition }) => ({ newShiftType, newPosition }))(this.state.errors);
    if (inputType === 'shiftType'){
      errors.newShiftType = 
      !(newInput.length > 0 && newInput.length <= 20)
        ? 'The type of shift must be a between 1 and 20 characters long'
        : '';
    } else if (inputType === 'position') {
      errors.newPosition = 
      !(newInput.length > 0 && newInput.length <= 20)
        ? 'The position must be a between 1 and 20 characters long'
        : '';
    }
    
    console.log(errors);
    if (!this.validateForm(errors)) {
      return this.setState({errors: Object.assign(this.state.errors, errors)});
    }

    const tip = {...this.state.tip};
    tip[inputType] = newInput;

    axios.put('http://localhost:5000/auth/userlists', {
      userID: this.state.tip.userID,
      listName: inputType + 's',
      newOption: newInput
    })
      .then(response => {
        console.log(response.data.message);
        this.setState({
          tip,
          [inputType + 'Options']: [newInput, ...this.state[inputType + 'Options']],
          newPosition: '',
          newShiftType: '',
          showPositionModal: false,
          showShiftTypeModal: false
        });
      })
      .catch(err => console.log(err));
  }

  validateForm = (errors) => {
    let valid = true;
    Object.values(errors).forEach(
      // if we have an error string set valid to false
      (val) => {
        if (val.length > 0) valid = false;
      }
    );
    return valid;
  }

  onCloseInputModal = () => {
    const errors = {...this.state.errors};

    errors.newPosition = '';
    errors.newShiftType = '';
    this.setState({ 
      errors, 
      showShiftTypeModal: false,
      showPositionModal: false
    });
  }

  options = (optionsArr) => {
    return optionsArr.map(name => {
      return <option key={name} value={name}>{name}</option>
    });
  }

  render() {
    const errors = this.state.errors;
    let positionsAndShiftTypes;
    if (!this.state.positionOptions.length) {
      positionsAndShiftTypes = (
        <Fragment>
        <div className="form-group">
          <label>Position: </label>
          <input 
            type="text" 
            className="form-control"
            id="position"
            value={this.state.tip.position}
            onChange={e => this.onChangeInput(e)}
          />
          {errors.position.length > 0 && 
            <span className='error text-danger'>{errors.position}</span>}
        </div>
        <div className="form-group">
          <label>Type of Shift: </label>
          <input 
            type="text" 
            className="form-control"
            id="shiftType"
            value={this.state.tip.shiftType}
            onChange={e => this.onChangeInput(e)}
          />
          {errors.shiftType.length > 0 && 
            <span className='error text-danger'>{errors.shiftType}</span>}
        </div>
        </Fragment>
      );
    } else {
      positionsAndShiftTypes = (
        <Fragment>
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
        </Fragment>
      );
    }

    return (
      <Fragment>
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
          {positionsAndShiftTypes}
          <div className="form-group">
            <label>Shift Length (in hours): </label>
            <input 
              type="number" 
              className="form-control"
              id="shiftLength"
              value={this.state.tip.shiftLength}
              onChange={e => this.onChangeInput(e)}
            />
            {errors.shiftLength.length > 0 && 
              <span className='error text-danger'>{errors.shiftLength}</span>}
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
            {errors.amount.length > 0 && 
              <span className='error text-danger'>{errors.amount}</span>}
          </div>
          
          <div className="form-group">
            <input type="submit" value={this.props.editing ? 'Update Tip' : 'Add Tip'} className="btn btn-primary" />
          </div>
        </form>
        {this.state.tipAdded === true && <span className="text-success" >Tip successfully added!</span>}
        <Modal show={this.state.showPositionModal} onHide={this.onCloseInputModal} >
          <Modal.Header closeButton>
            <Modal.Title>Add a Position</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <label>Position:</label>
            <input 
              type="text" 
              className="form-control" 
              id="newPosition"
              ref={(text) => { this.input = text; }} 
              onChange={e => this.onChangeInput(e)}
            />
            {errors.newPosition.length > 0 && 
              <span className='error text-danger'>{errors.newPosition}</span>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.onCloseInputModal}>
              Close
            </Button>
            <Button variant="primary" onClick={() => this.onSubmitNewInput('position')}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.showShiftTypeModal} onHide={this.onCloseInputModal}>
          <Modal.Header closeButton>
            <Modal.Title>Add a Shift Type</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <label>Type of Shift:</label>
            <input 
              type="text" 
              className="form-control" 
              id="newShiftType"
              ref={(text) => { this.input = text; }} 
              onChange={e => this.onChangeInput(e)}
            ></input>
            {errors.newShiftType.length > 0 && 
              <span className='error text-danger'>{errors.newShiftType}</span>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.onCloseInputModal}>
              Close
            </Button>
            <Button variant="primary" onClick={() => this.onSubmitNewInput('shiftType')}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </Fragment>

    );
  }
}

