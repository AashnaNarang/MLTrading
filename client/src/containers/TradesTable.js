import React, { Component } from 'react';
import { DataGrid } from '@material-ui/data-grid';
import '../TradesTable.css'
import axios from "axios";
import {HOST, SECURITY_URI, TRADES_URI} from "../constants";
import {generateHeaders} from "../api/utilities";

const columns = [
  {
    field: 'id',
    hide: true,
  },
  {
    field: 'action',
    headerName: 'Action',
    width: 170,
  },
  {
    field: 'securityCode',
    headerName: 'Security',
    width: 170,
  },
  {
    field: 'price',
    headerName: 'Price',
    width: 170,
  },
  {
    field: 'sharesTraded',
    headerName: 'Shares',
    width: 170,
  },
  {
    field: 'transactionCost',
    headerName: 'Transaction Fee',
    width: 180,
  },
  {
    field: 'profit',
    headerName: 'Profit',
    width: 170,
  },
  {
    field: 'dateTraded',
    headerName: 'Date',
    width: 170
  },

];


class TradesTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      rowCount: 0,
      trades: [],
    };
  }

  componentDidUpdate(prevProps) {
    const { page } = this.state
    const { portfolioId } = this.props

    if (prevProps.portfolioId !== portfolioId) {
      this.getTrades(portfolioId, page)
    }

  }

  getTrades = (portfolioId, page) => {
    const tradeParams = {portfolio: portfolioId, sortBy: 'dateTraded:desc', limit: 5, page}
    axios
      .get(`${HOST}${TRADES_URI}`, {params: tradeParams, ...generateHeaders()})
      .then(res => {
        res.data.results = res.data.results.map((result) => {

          const dateTraded = new Date(result.dateTraded)

          return {
            ...result,
            dateTraded : ('0' + dateTraded.getDate()).slice(-2) + '/'
              + ('0' + (dateTraded.getMonth()+1)).slice(-2) + '/'
              + dateTraded.getFullYear()
          }
        })
        this.setState({trades: res.data.results, rowCount: res.data.totalResults});
      })
      .catch(err => {
        console.log(`error: ${err.message}`);
      });
  }

  onPageChange = (page)  => {
    const { portfolioId } = this.props

    this.setState({page: page + 1})

    this.getTrades(portfolioId, page+1)
  }

  render() {
    const { page, trades, rowCount } = this.state
    return (
      <>
        <h5 className='heading'>Trading History</h5>
        <DataGrid
          onPageChange={(newPage) => this.onPageChange(newPage)}
          pagination
          paginationMode="server"
          autoHeight
          rowCount={rowCount}
          rows={trades}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
        />
      </>
    )
  }
} 


export default TradesTable;
