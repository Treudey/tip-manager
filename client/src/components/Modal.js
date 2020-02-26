import React from 'react';
import { Modal as BootstrapModal, Button } from 'react-bootstrap';

const Modal = props => {
  return (
    <BootstrapModal show={props.show} onHide={props.handleClose}>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>{props.title}</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        {props.children}
      </BootstrapModal.Body>
      <BootstrapModal.Footer>
        <Button variant="secondary" onClick={props.handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={props.handleAccept}>
          {props.acceptButtonText}
        </Button>
      </BootstrapModal.Footer>
    </BootstrapModal>
  );
};

export default Modal;