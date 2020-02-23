import React from 'react';
import TipForm from '../components/TipForm';

const EditTip = (props) => {
 
  return (
    <div className='container-fluid'>
      <h3>Edit Tip</h3>
      <TipForm 
        userID={props.userID}
        editing={true}
        tipID={props.match.params.id}
        history={props.history}
      />
    </div>
  );
}

export default EditTip;