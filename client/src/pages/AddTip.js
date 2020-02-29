import React from 'react';
import TipForm from "../components/TipForm";

const AddTip = (props) => (
  <div className='container-fluid'>
    <h3>Add a Tip</h3>
    <TipForm 
      token={props.token}
      editing={false}
      tipID={null}
    />
  </div> 
);

export default AddTip;