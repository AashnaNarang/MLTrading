import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from 'axios';

import { USER_TOKEN, HOST, PORTFOLIO_URI } from '../constants';
import { logout } from '../store/actions/auth.action';
import jwt_decode from "jwt-decode"
import { getTokenFromLocalStorage } from '../utils';
import { generateHeaders } from '../api/utilities';

import Landing from '../components/Landing';
import Home from '../components/Home';

class HomePage extends Component {
  constructor() {
    super();
    this.state = {
      userId: '',
      portfolio: {
        user: '619308412ff24d3d28d7fe2b', 
        portfolioType: 'personal', 
        currPortfolioValue: '500.00', 
        initialFreeCash: '150.00',
        freeCash: '150.00', 
        transactionCost: '1.5', 
        profit: '100.00'
      },
    };

    // console.log(jwt_decode(getTokenFromLocalStorage(USER_TOKEN)));
    // this.state.userId = jwt_decode(getTokenFromLocalStorage(USER_TOKEN));
    this.onClick = this.onClick.bind(this);
  }

  onClick = e => {
    e.preventDefault();
    localStorage.removeItem(USER_TOKEN);
    this.props.logout();
  };


  render() {
    const { user } = this.props || {};
    let loggedIn = user && user.token
    if (loggedIn) {
      var decodedHeader = jwt_decode(getTokenFromLocalStorage(USER_TOKEN), { header: false });
      this.state.userId = decodedHeader.sub;

      // axios
      // .get(`${HOST}${PORTFOLIO_URI}/${decodedHeader.sub}`, generateHeaders())
      // .then(res => {
      //   this.state.portfolio = res.data.portfolio;
      // })
      // .catch(err => {
      //   console.log(`error: ${err.message}`);
      //   // dispatch(registerFailed(err));
      // });
    }

    return loggedIn ? (
      <Home logout={e => this.onClick(e)} userId={this.state.userId} portfolio={this.state.portfolio} />
    ) : (
      <Landing />
    );
  }
}



// Store
function mapStateToProps(state) {
  return {
    user: state.user,
  };
}

function matchDispatchToProps(dispatch) {
  return bindActionCreators({ logout }, dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(HomePage);
