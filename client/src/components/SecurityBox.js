import React, { Component } from 'react';
import '../SecurityBox.css'

class SecurityBox extends Component {

  render() {
    const {name, shares, avgPrice, ticker, totalValue} = this.props
    return (
      <div className='box'>
        <div className='sb-flex-col'>
          <div className='name'>{name}</div>
          <div className='share'>{shares}</div>
          <div className='price'>{avgPrice}</div>
        </div>
        <div className='ticker'>{ticker}</div>
      </div>
    )
  }

}


export default SecurityBox;
