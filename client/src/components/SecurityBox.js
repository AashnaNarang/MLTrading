import React, { useState, Component } from 'react';
import '../SecurityBox.css'
import SecuritiesModal from "./SecuritiesModal";
import { Modal } from "react-bootstrap";
import Button from "@material-ui/core/Button";

let modal;

function getNumberOfShares(shares) {
  if (shares === 1)
    return "share"
  else
    return "shares"
}

class SecurityBox extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    }
  }

  createModal = () => {
    return (
      <Modal
        show={this.state.showModal}
        close={() => this.setState({ showModal: false })}
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
          <Button onClick={() => this.setState({ showModal: false })}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }


  handleClick = (e, data) => {
    if (data) {
      console.log("hi")
      this.createModal(this.props);
    }

  }

  render() {
    const { name, shares, avgPrice, ticker, totalValue } = this.props

    // function openTheModal(showModal){
    //   if(showModal){
    //     return 
    //   }
    // }

    return (
      // onClick={((e) => this.handleClick(e, this.state.showModal))}
      <>
        {this.createModal()}
        <div className='box' onClick={(e) => this.setState({ showModal: true })}>
          <div className='sb-flex-col'>
            <div className='name'>{name}

              {/* <SecuritiesModal show={this.state.showModal} close={() => this.setState({showModal: false})} /> */}

            </div>
            <div className='share'>{shares} {getNumberOfShares(shares)}</div>
            <div className='price'>{avgPrice}</div>
          </div>
          <div className='ticker'>{ticker}</div>
        </div>
      </>
    )
  }

}


export default SecurityBox;
