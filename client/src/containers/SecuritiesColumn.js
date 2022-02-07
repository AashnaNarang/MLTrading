import React, { Component } from 'react';
import axios from 'axios';
import ArrowBack from "@material-ui/icons/ArrowBack"
import ArrowForward from "@material-ui/icons/ArrowForward"
import Button from "@material-ui/core/Button"
import {HOST, SECURITY_URI} from '../constants';
import SecurityBox from "../components/SecurityBox";
import "../SecuritiesColumn.css"
import {generateHeaders} from "../api/utilities";


class SecuritiesColumn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      securities: [],
      page: 1,
      totalPages: 1,
    };
  }

  componentDidUpdate(prevProps) {
    const { page } = this.state
    const { portfolioId } = this.props

    if (prevProps.portfolioId !== portfolioId) {
      const securityParams = {portfolio: portfolioId, sortBy: 'securityName:asc', limit: 5, page}
      axios
        .get(`${HOST}${SECURITY_URI}`, {params: securityParams, ...generateHeaders()})
        .then(res => {
          this.setState({securities: res.data.results, totalPages: res.data.totalPages});
        })
        .catch(err => {
          console.log(`error: ${err.message}`);
        });
    }

  }

  onPageChange = (page) => () => {
    const { portfolioId } = this.props

    this.setState({page})


    const securityParams = {portfolio: portfolioId, sortBy: 'securityName:asc', limit: 5, page}
    axios
      .get(`${HOST}${SECURITY_URI}`, {params: securityParams, ...generateHeaders()})
      .then(res => {
        this.setState({securities: res.data.results});
      })
      .catch(err => {
        console.log(`error: ${err.message}`);
      });
  }

  render() {
    const { securities, page, totalPages } = this.state

    const securityBoxes = securities.map((security) => {
      const {securityName, shares, avgPrice, securityCode, totalValue} = security
      return <SecurityBox name={securityName} shares={shares} avgPrice={avgPrice} ticker={securityCode} totalValue={totalValue}/>
    })



    return(
      <div className='sc-flex-col'>
        <h5 className='sc-securities-title'>Your Securities</h5>
        <div className='sc-column'>
          {securityBoxes}
        </div>
        {securities.length !==0 && <div className='sc-buttons'>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={this.onPageChange(page-1)} disabled={page===1}>
            Prev
          </Button>
          <Button variant="outlined" endIcon={<ArrowForward />} onClick={this.onPageChange(page+1)} disabled={page===totalPages}>
            Next
          </Button>
        </div>}
      </div>
    )
  }
}

export default SecuritiesColumn;
