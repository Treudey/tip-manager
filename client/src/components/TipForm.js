import React, { Component, Fragment } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import Modal from '../components/Modal';
import ErrorModal from '../components/ErrorModal';
import { validateForm } from '../utils/validators';

export default class TipForm extends Component {
  state = {
    token: this.props.token,
    tip: {
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
    showShiftTypeModal: false,
    tipAdded: false,
    messageTimer: null,
    formErrors: {
      amount: '',
      shiftLength: '',
      position: '',
      shiftType: '',
      newPosition: '',
      newShiftType: ''
    },
    error: null,
    formLoading: true
  };

  componentDidMount() {
    this.loadData();
  }

  loadData() {
    axios.get('/auth/userlists', { 
      headers: {
        Authorization: 'Bearer ' + this.state.token
      }
    })
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
            '/tips/' + this.props.tipID,
            { 
              headers: {
                Authorization: 'Bearer ' + this.state.token
              }
            }
          )
          .then(res => {
            console.log(res.data.message);
            const responseTip = res.data.tip;
            tip.amount = responseTip.amount;
            tip.position = responseTip.position;
            tip.shiftType = responseTip.shiftType;
            tip.shiftLength = responseTip.shiftLength;
            tip.date = new Date(responseTip.date);
            this.setState({ tip, formLoading: false }); 
          })
          .catch(err => {
            console.log(err);
            err = new Error('Failed to load tip.');
            this.setState({ error: err });
          });
        }
        this.setState({ formLoading: false });
      })
      .catch(err => {
        console.log(err);
        err = new Error('Failed to load user data.');
        this.setState({ error: err });
      });
  }

  componentWillUnmount() {
    clearTimeout(this.state.messageTimer);
  }

  onChangeInput = (e) => {
    const errors = {...this.state.formErrors};

    if (Object.keys(errors).includes(e.target.id) || this.state.hasOwnProperty(e.target.id)) {
      if (errors[e.target.id] !== '') {
        errors[e.target.id] = '';
        this.setState({ formErrors: errors });
      }
    }

    if (this.state.hasOwnProperty(e.target.id)) {
      return this.setState({ [e.target.id]: e.target.value.trim() });
    }

    const tip = {...this.state.tip};
    if (e.target.value === 'New' && e.target.id === 'position') {
      tip.position = this.state.positionOptions[0];
      return this.setState(
        {tip, showPositionModal: true},
        () => {
          setTimeout(() => {this.input && this.input.focus()}, 1);
        }
      );
    }
    if (e.target.value === 'New' && e.target.id === 'shiftType') {
      tip.shiftType = this.state.shiftTypeOptions[0];
      return this.setState(
        {tip, showShiftTypeModal: true},
        () => {
          setTimeout(() => {this.input && this.input.focus()}, 1);
        }
      );
    }

    tip[e.target.id] = e.target.value.trim();
    this.setState({tip});
  };

  
  onSubmitTipForm = (e) => {
    e.preventDefault();
    this.setState({ formLoading: true });
    const tip = {...this.state.tip};
    const errors = {...this.state.formErrors};
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
   
    if (!validateForm(errors)) {
      return this.setState({ formErrors: errors, formLoading: false });
    }


    if (this.props.editing) {
      axios.put('/tips/' + this.props.tipID, tip, { 
        headers: {
          Authorization: 'Bearer ' + this.state.token
        }
      })
        .then(res => {
          console.log(res.data.message);
          this.setState({ formLoading: false });
          this.props.history.replace('/alltips');
        })
        .catch(err => {
          console.log(err);
          err = new Error('Can\'t update tip!');
          this.setState({ error: err, formLoading: false });
        });

    } else {
      axios.post('/tips/create', tip, { 
        headers: {
          Authorization: 'Bearer ' + this.state.token
        }
      })
      .then(res => { 
        console.log(res.data.message);
        
        tip.amount = 0;
        tip.shiftLength = 0;
        tip.date = new Date();
        this.setState({
          tip,
          tipAdded: true,
          formLoading: false,
          messageTimer: setTimeout(() => this.setState({ tipAdded: false }), 3000)
        });
        this.loadData();
      })
      .catch(err => {
        console.log(err);
        err = new Error('Failed to create new tip.');
        this.setState({ error: err, formLoading: false });
      });
    }
  };

  onSubmitNewInput = (inputType) => {
    const newInput = this.state['new' + inputType.replace(inputType.charAt(0), inputType.charAt(0).toUpperCase())];
    const errors =  (({ newShiftType, newPosition }) => ({ newShiftType, newPosition }))(this.state.formErrors);
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
  
    if (!validateForm(errors)) {
      return this.setState({  formErrors: Object.assign(this.state.formErrors, errors) });
    }

    const tip = {...this.state.tip};
    tip[inputType] = newInput.trim();
    let optionsList;
    if (!this.state[inputType + 'Options'].includes(newInput)) {
      optionsList = [newInput.trim(), ...this.state[inputType + 'Options']];
    }

    this.setState({
      tip,
      [inputType + 'Options']: optionsList || this.state[inputType + 'Options'],
      newPosition: '',
      newShiftType: '',
      showPositionModal: false,
      showShiftTypeModal: false
    });
  };

  handleKeyPressNewInput = (e) => {
    if(e.key === 'Enter') {
      let input = e.target.id.substring(3);
      input = input.replace(input.charAt(0), input.charAt(0).toLowerCase());
      this.onSubmitNewInput(input);
    }
  };

  onCloseInputModal = () => {
    const errors = {...this.state.formErrors};
    errors.newPosition = '';
    errors.newShiftType = '';
    this.setState({ 
      formErrors: errors, 
      showShiftTypeModal: false,
      showPositionModal: false
    });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  options = (optionsArr) => {
    return optionsArr.map(name => {
      return <option key={name} value={name}>{name}</option>
    });
  };

  render() {
    const errors = this.state.formErrors;
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
            placeholder="e.g. Bartender"
            onChange={this.onChangeInput}
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
            placeholder="e.g. Close"
            onChange={this.onChangeInput}
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
            onChange={this.onChangeInput}
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
            onChange={this.onChangeInput}
          >
            {this.options(this.state.shiftTypeOptions)}
          </select>
        </div>
        </Fragment>
      );
    }

    return (
      <Fragment>
        <ErrorModal error={this.state.error} onHandle={this.errorHandler} />
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
              value={this.state.tip.shiftLength || ''}
              placeholder={0}
              onChange={this.onChangeInput}
            />
            {errors.shiftLength.length > 0 && 
              <span className='error text-danger'>{errors.shiftLength}</span>}
          </div>
          <div className="form-group"> 
            <label>Amount: </label>
            <input  
              type="number"
              className="form-control"
              id="amount"
              value={this.state.tip.amount || ''}
              placeholder={0}
              onChange={this.onChangeInput}
            />
            {errors.amount.length > 0 && 
              <span className='error text-danger'>{errors.amount}</span>}
          </div>
          
          <div className="form-group">
            <input 
              type="submit" 
              disabled={this.state.formLoading}
              value={this.state.formLoading ? 'Loading...' : (this.props.editing ? 'Update Tip' : 'Add Tip')} 
              className="btn btn-success" 
            />
          </div>
        </form>
        {this.state.tipAdded && 
          <span className="text-success" >Tip successfully added!</span>}
        {!this.props.editing && 
          <Link to="/upload" >Upload a CSV File</Link>}
        <Modal 
          title="Add a Position"
          acceptButtonText="Save"
          show={this.state.showPositionModal} 
          handleClose={this.onCloseInputModal} 
          handleAccept={() => this.onSubmitNewInput('position')}
        >
          <label>Position:</label>
          <input 
            type="text" 
            className="form-control" 
            id="newPosition"
            value={this.state.newPosition}
            placeholder="e.g. Server"
            ref={(text) => { this.input = text; }} 
            onChange={this.onChangeInput}
            onKeyPress={this.handleKeyPressNewInput}
          />
          {errors.newPosition.length > 0 && 
            <span className='error text-danger'>{errors.newPosition}</span>}
        </Modal>
        <Modal 
          acceptButtonText="Save"
          title="Add a Shift Type"
          show={this.state.showShiftTypeModal} 
          handleClose={this.onCloseInputModal}
          handleAccept={() => this.onSubmitNewInput('shiftType')}
        >
          <label>Type of Shift:</label>
          <input 
            type="text" 
            className="form-control" 
            id="newShiftType"
            value={this.state.newShiftType}
            placeholder="e.g. Open"
            ref={(text) => { this.input = text; }} 
            onChange={this.onChangeInput}
            onKeyPress={this.handleKeyPressNewInput}
          ></input>
          {errors.newShiftType.length > 0 && 
            <span className='error text-danger'>{errors.newShiftType}</span>}
        </Modal>
      </Fragment>

    );
  }
}

