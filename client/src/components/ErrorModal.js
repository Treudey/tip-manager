import React, { Fragment } from 'react';

import Modal from '../components/Modal';

const ErrorModal = props => (
  <Fragment>
    {props.error && (
      <Modal 
          title="An Error Occured"
          acceptButtonText="Accept"
          show={props.error !== null} 
          handleClose={props.onHandle} 
          handleAccept={props.onHandle}
        >
          <p>{props.error.message}</p>
      </Modal>
    )}
  </Fragment>
  
);

export default ErrorModal;