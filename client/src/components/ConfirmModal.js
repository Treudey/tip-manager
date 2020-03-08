import React from 'react';

import Modal from './Modal';

const ConfirmModal = (props) => (
  <Modal 
      title="Are You Sure?"
      acceptButtonText="Confirm"
      show={props.isEnabled} 
      handleClose={props.onCancel} 
      handleAccept={props.onConfirm}
    >
      <p>This action cannot be undone. Please confirm your decision.</p>
  </Modal>
);

export default ConfirmModal;