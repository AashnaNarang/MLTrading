import React from 'react';
import { Link } from 'react-router-dom';
import GreyBox from './GreyBox';
import '../Home.css';
import PortfolioGraph from './PortfolioGraph';

const Home = props => {
  let content = (
    <div className="flex-row">
      <div className="flex-col">
        <body className="portfolioValue-subtitle"> portfolio value </body>
        <body className="portfolioValue-amount"> ${props.portfolio.currPortfolioValue} </body>
      </div>
      <div className="flex-col">
        <body className="freeCash-subtitle"> available to trade </body>
        <body className="freeCash-amount"> ${props.portfolio.freeCash} </body>
      </div>
    </div>
  )

  return (
    <div>
      <div>
        <div className="flex-col-main">
          <div className="hello-row">
            <h2 className="hello"> Hello, you have made  </h2>
            <h2 className="profit"> ${props.portfolio.profit}</h2>
          </div>
          <br />
          <div>
            <br />
            <br />
          </div>
          <GreyBox title="Your Information" content={content} />
          <PortfolioGraph title="Portfolio Graph" portfolioId={props.portfolio.id}/>
        </div>
      </div>
      <br />
      <Link
        to="/"
        onClick={props.logout}
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
  );
};
export default Home;
