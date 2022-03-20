import React from 'react';
import {Link} from 'react-router-dom';
import GreyBox from './GreyBox';
import '../Home.css';
import TradesTable from "../containers/TradesTable";
import SecuritiesColumn from "../containers/SecuritiesColumn";
import PortfolioGraph from './PortfolioGraph';

 function calculateSign(profit) {
  let word;
  if (profit > 0){
      word = "made ";
  }
  else{
    word = "lost ";
  }
  return word;
}

function profitClassName(profit) {
  let className;
  if (profit > 0){
      className = "profit";
  }
  else{
    className = "loss";
  }
  return className;
}

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
        <Link
          to="/settings"
          style={{
            width: '140px',
            borderRadius: '3px',
            letterSpacing: '1.5px',
          }}
          className="btn btn-large waves-effect waves-light hoverable blue accent-3"
        >
          Settings
        </Link>
        <div className="hello-row">
          <h2 className="hello"> Hello, you have {calculateSign(profit)}</h2>
          <h2 className={profitClassName(profit)}> ${Math.abs(profit)}</h2>
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
