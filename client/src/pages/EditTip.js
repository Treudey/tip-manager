import React from 'react';
import TipForm from '../components/TipForm';

const EditTip = (props) =>  (
  <div className='container-fluid'>
    <h3>Edit Tip</h3>
    <TipForm 
    token={props.token}
      editing={true}
      tipID={props.match.params.id}
      history={props.history}
    />
  </div>
);

export default EditTip;