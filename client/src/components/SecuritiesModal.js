import React, { useState, useCallback } from 'react'
import { Modal } from "react-bootstrap";
import "../styles.css";
import Button from "@material-ui/core/Button";

const SecuritiesModal = (props) => {
  return (
    <>
      <Modal
        show={props.show}
        cancel={props.close}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Are you sure to Logout?</h4>
        </Modal.Body>
        <Modal.Footer>
          {/* <Button onClick={props.close}>Cancel</Button> */}
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default SecuritiesModal