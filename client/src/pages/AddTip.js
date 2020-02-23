import React from 'react';
import TipForm from "../components/TipForm";

const AddTip = (props) => {
    
  return (
  <div className='container-fluid'>
    <h3>Add a Tip</h3>
    <TipForm 
      userID={props.userID}
      editing={false}
      tipID={null}
    />
  </div> 
  );
}

export default AddTip;