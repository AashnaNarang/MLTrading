import React, {useState, Component} from 'react';
import '../SecurityBox.css'
import {Modal} from "react-bootstrap";
import Button from "@material-ui/core/Button";

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
                close={() => this.setState({showModal: false})}
                size="lg"
                //aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h4>Are you sure to Logout?</h4>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => this.setState({showModal: false})}>Cancel</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    render() {
        const {name, shares, avgPrice, ticker, totalValue} = this.props

        return (
            <>
                <div className='modal'>
                    {this.createModal()}
                </div>
                <div className='box' onClick={(e) => this.setState({showModal: true})}>
                    <div className='sb-flex-col'>
                        <div className='name'>{name}</div>
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
