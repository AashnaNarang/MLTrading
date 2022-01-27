import React from 'react';
import {Link} from 'react-router-dom';
import GreyBox from './GreyBox';
import '../Home.css';
import TradesTable from "./TradesTable";

const Home = props => {

    const {portfolio, logout} = props;
    const {profit, currPortfolioValue, freeCash} = portfolio
    const content = (
    <div className="flex-row">
      <div className="flex-col">
          <body className="portfolioValue-subtitle"> portfolio value </body>
          <body className="portfolioValue-amount"> ${currPortfolioValue} </body>
      </div>
      <div className="flex-col">
        <body className="freeCash-subtitle"> available to trade </body>
        <body className="freeCash-amount"> ${freeCash} </body>
      </div>
    </div>
  )
  
  return (
    <>
      <div className="flex-col-main">
        <div className="hello-row">
          <h2 className="hello"> Hello, you have made  </h2>
          <h2 className="profit"> ${profit}</h2>
        </div>
        <GreyBox title="Your Information" content={content} />
        <TradesTable />
        <Link
          to="/"
          onClick={logout}
          style={{
            color: 'black',
            letterSpacing: '1.5px',
            fontFamily: 'Inter'
          }}
          className="btn-link hoverable "
        >
          Logout
        </Link>
      </div>
    </>
  );
};

export default Home;
