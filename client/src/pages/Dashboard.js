import React, { Component } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';

const Tip = props => (
  <tr>
    <td>{props.tip.date.substring(0,10)}</td>
    <td>{props.tip.amount}</td>
    <td>{props.tip.shiftLength}</td>
    <td>
      <Link to={"/edit/" + props.tip._id}>Edit</Link> | <a href="#" onClick={ () => props.deleteTip(props.tip._id) }>Delete</a>
    </td>
  </tr>
);


export default class Dashboard extends Component {

  constructor(props) {
    super(props);

    this.deleteTip = this.deleteTip.bind(this);

    this.state = { 
      name: '',
      email: '',
      password: '',
      tips: []
     };
  } 

  componentDidMount() {
    axios.get('http://localhost:5000/auth/userdata?userID=' + this.props.userID)
      .then(response => {
        console.log(response.data.message);
        const user = response.data.user;
        this.setState({ 
          name: user.name,
          email: user.email,
          password: user.password,
          tips: user.tips
        })
      })
      .catch(err => console.log(err));
  }

  deleteTip(id) {
    axios.delete('http://localhost:5000/tips/' + id, {
      data: {
        userID: this.props.userID
      }  
    })
      .then(res => console.log(res.data))
      .catch(err => console.log(err));

    this.setState({
      tips: this.state.tips.filter(el => el._id !== id)
    });
  }

  tipList() {
    return this.state.tips.map(tip => {
      return <Tip tip={tip} deleteTip={this.deleteTip} key={tip._id} />;
    })
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row jumbotron text-center">
          <div className="col-12">
            <h1 className="display-2">Welcome {this.state.name}</h1>
          </div>
          <div className="col-12">
            <p>Tips Made Total:</p>
            <p>Tips Made This Year:</p>
            <p>Tips Made Month:</p>
          </div>
        </div>
        <div className="row">
          <h2>Your Tips</h2>
          <table className="table">
            <thead className="thead-light">
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Shift Length (hrs)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {this.tipList()}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}