import React, { Component } from 'react';
import { DataGrid } from '@material-ui/data-grid';
import '../TradesTable.css'

const columns = [
  {
    field: 'id',
    hide: true,
  },
  {
    field: 'action',
    headerName: 'Action',
    flex: 1,
  },
  {
    field: 'security',
    headerName: 'Security',
    flex: 1,
  },
  {
    field: 'price',
    headerName: 'Price',
    flex: 1,
  },
  {
    field: 'shares',
    headerName: 'Shares',
    flex: 1,
  },
  {
    field: 'transactionFee',
    headerName: 'Transaction Fee',
    flex: 1,
  },
  {
    field: 'profit',
    headerName: 'Profit',
    flex: 1,
  },
  {
    field: 'date',
    headerName: 'Date',
    flex: 1
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
      rowsPerPage: 4,
    };
  }

  handleChangePage = (event, newPage) => {
    this.setState({page: newPage});
  };

  render() {
    const { page, rowsPerPage } = this.state
    return (
      <>
        <h5 style={{fontFamily: "Inter", fontWeight: 600, fontSize: "24px" }}>Trading History</h5>
        <DataGrid
          autoHeight
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
        />
      </>
    )
  }
} 


export default TradesTable;
