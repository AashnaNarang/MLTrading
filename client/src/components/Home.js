import React from 'react';
import {Link} from 'react-router-dom';
import GreyBox from './GreyBox';
import '../Home.css';
import TradesTable from "../containers/TradesTable";
import SecurityBox from "./SecurityBox";
import SecuritiesColumn from "../containers/SecuritiesColumn";
import PortfolioGraph from './PortfolioGraph';

const Home = props => {

    const {portfolio, logout} = props;
    const {profit, currPortfolioValue, freeCash} = portfolio
    const content = (
    <div className="flex-row grey-box">
      <div className="flex-col">
          <div className="portfolioValue-subtitle"> portfolio value </div>
          <div className="portfolioValue-amount"> ${currPortfolioValue} </div>
      </div>
      <div className="flex-col">
        <div className="freeCash-subtitle"> available to trade </div>
        <div className="freeCash-amount"> ${freeCash} </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="flex-col main">
        <div className="hello-row">
          <h2 className="hello"> Hello, you have made  </h2>
          <h2 className="profit"> ${profit}</h2>
        </div>
        <div className='flex-row'>
          <div className='flex-col left-col'>
            <GreyBox title="Your Information" content={content} />
            <PortfolioGraph title="Portfolio-Graph" portfolioId={portfolio.id} />
            <TradesTable portfolioId={portfolio.id}/>
          </div>
          <SecuritiesColumn portfolioId={portfolio.id}/>
        </div>
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
