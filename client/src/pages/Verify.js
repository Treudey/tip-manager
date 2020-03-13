import React from 'react';
import { Button } from 'react-bootstrap';

const VerifyPage = (props) => {

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  return (
    <div>
      <h3>Please Verify Your Account</h3>
      <p>Click this button to verify your account.</p>
      <Button 
        variant="success"
        onClick={() => props.onVerify(token)}
      >
        {props.loading ? 'Loading...' : 'Verify Account'} 
      </Button>
    </div>
  );
  
};

export default VerifyPage;