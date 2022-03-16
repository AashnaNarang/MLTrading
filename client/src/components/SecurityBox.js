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

/**
 * Calculate the percentage lost or gained in a stock
 * @param totalValue
 * @param currentTotalValue
 * @returns {string}
 */
function calculatePercentage(totalValue, currentTotalValue) {
    let value = (1 - (currentTotalValue / totalValue)) * 100
    let sign = '-'
    value = Math.abs(Math.round(value * 100) / 100)
    if (currentTotalValue > totalValue)
        sign = '+'
    return sign + value + "%"
}

function convertDate(date) {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    const time = new Date(date);
    const timeString = (monthNames[time.getMonth()]) + ' ' + time.getDate() + ', ' + time.getFullYear();
    return timeString.toString()
}

/**
 * Number formatter from string to US dollar value.
 * @type {Intl.NumberFormat}
 */
var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',

    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

class SecurityBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showModal: false
        }
    }

    createModal = (name, shares, currentPrice, ticker, totalValue, currTotalValue, totalReturn, avgPrice, lastUpdated) => {
        return (
            <Modal
                show={this.state.showModal}
                close={() => this.setState({showModal: false})}
                centered
            >
                <Modal.Header>
                    <Modal.Title>
                        <div class="closeButton topright">
                            <h5>
                                <Button onClick={() => this.setState({showModal: false})}>Exit</Button>
                            </h5>
                        </div>

                        <h3>
                            <center><b>{name} ({ticker})</b></center>
                        </h3>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <body>
                    <div class="popupBox">
                        <table cellspacing="0" cellpadding="0">
                            <tr>
                                <td><b>Average Price:</b> {formatter.format(avgPrice)}</td>
                                <td><b>Share Price:</b> {formatter.format(currentPrice)}</td>
                            </tr>
                            <tr>
                                <td><b>Shares:</b> {shares}</td>
                                <td><b>Current Total Value:</b> {formatter.format(currTotalValue)}</td>
                            </tr>
                            <tr>
                                <td><b>Total Value:</b> {formatter.format(totalValue)}</td>
                                <td><b>Total
                                    Return:</b> {formatter.format(totalReturn)}({calculatePercentage(totalValue, currTotalValue)})
                                </td>

                            </tr>
                        </table>
                    </div>
                    </body>
                </Modal.Body>
                <Modal.Footer>
                    <div class="lastUpdated">
                        <p>Purchased on {convertDate(lastUpdated)}</p>
                    </div>
                </Modal.Footer>
            </Modal>
        );
    }

    render() {
        const {
            name,
            shares,
            currentPrice,
            ticker,
            totalValue,
            currTotalValue,
            totalReturn,
            avgPrice,
            lastUpdated
        } = this.props

        return (
            <>
                <div className='modal'>
                    {this.createModal(name, shares, currentPrice, ticker, totalValue, currTotalValue, totalReturn, avgPrice, lastUpdated)}
                </div>
                <div className='box' onClick={(e) => this.setState({showModal: true})}>
                    <div className='sb-flex-col'>
                        <div className='name'>{name}</div>
                        <div className='share'>{shares} {getNumberOfShares(shares)}</div>
                        <div className='price'>{currentPrice}</div>
                    </div>
                    <div className='ticker'>{ticker}</div>
                </div>
            </>
        )
    }

}


export default SecurityBox;
