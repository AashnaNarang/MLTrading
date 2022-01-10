import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from 'axios';

import { USER_TOKEN, HOST, PORTFOLIO_USER_URI } from '../constants';
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
        user: '', 
        portfolioType: '', 
        currPortfolioValue: '', 
        initialFreeCash: '',
        freeCash: '', 
        transactionCost: '', 
        profit: ''
      },
    };

    this.onClick = this.onClick.bind(this);
  }

  onClick = e => {
    e.preventDefault();
    localStorage.removeItem(USER_TOKEN);
    this.props.logout();
  };

  componentDidMount() {
    var decodedHeader = jwt_decode(getTokenFromLocalStorage(USER_TOKEN), { header: false });
    this.setState({userId: decodedHeader.sub});

    axios
      .get(`${HOST}${PORTFOLIO_USER_URI}/${decodedHeader.sub}`, generateHeaders())
      .then(res => {
        this.setState({portfolio: res.data});
      })
      .catch(err => {
        console.log(`error: ${err.message}`);
        // dispatch(registerFailed(err));
    });
  }

  render() {
    const { user } = this.props || {};
    let loggedIn = user && user.token

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
