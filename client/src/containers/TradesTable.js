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

const rows = [
  { id: 0, action: "Purchased", security: 'TSLA', price: 755.35, shares: 5, transactionFee: 3.50, profit: null, date: "10/10/2021" },
  { id: 1, action: "Sold", security: 'AAPL', price: 1345.90, shares: 2, transactionFee: 3.50, profit: 200.05, date: "03/10/2021" },
  { id: 2, action: "Purchased", security: 'TSLA', price: 755.87, shares: 3, transactionFee: 3.50, profit: null, date: "01/10/2021" },
  { id: 3, action: "Purchased", security: 'AMZN', price: 3345.87, shares: 3, transactionFee: 2.50, profit: null, date: "23/09/2021" },
  { id: 4, action: "Sold", security: 'SHOP', price: 1456.98, shares: 10, transactionFee: 2.50, profit: 24.56, date: "14/09/2021" },
  { id: 5, action: "Purchased", security: 'TSLA', price: 755.35, shares: 5, transactionFee: 3.50, profit: null, date: "10/10/2021" },
  { id: 6, action: "Purchased", security: 'TSLA', price: 755.35, shares: 5, transactionFee: 3.50, profit: null, date: "10/10/2021" },
  { id: 7, action: "Purchased", security: 'TSLA', price: 755.35, shares: 5, transactionFee: 3.50, profit: null, date: "10/10/2021" },
  { id: 8, action: "Purchased", security: 'TSLA', price: 755.35, shares: 5, transactionFee: 3.50, profit: null, date: "10/10/2021" },
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
