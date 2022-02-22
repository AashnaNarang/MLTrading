import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from 'axios';

import {USER_TOKEN, HOST, PORTFOLIO_USER_URI, USERS_URI} from '../constants';
import { logout } from '../store/actions/auth.action';
import jwt_decode from "jwt-decode"
import { getTokenFromLocalStorage } from '../utils';
import { generateHeaders } from '../api/utilities';

import Landing from '../components/Landing';
import Settings from "../components/Settings";

class SettingsPage extends Component {
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
      userInfo: {
        id: "",
        email: "",
        name: "",
        role: ""
      }
    };


    this.onClick = this.onClick.bind(this);
  }

  onClick = e => {
    e.preventDefault();
    localStorage.removeItem(USER_TOKEN);
    this.props.logout();
  };

  componentDidMount() {
    var token = getTokenFromLocalStorage(USER_TOKEN);
    if (token) {
      var decodedHeader = jwt_decode(token, { header: false });
      this.setState({ userId: decodedHeader.sub });

      axios
        .get(`${HOST}${PORTFOLIO_USER_URI}/${decodedHeader.sub}`, generateHeaders())
        .then(res => {
          this.setState({ portfolio: res.data });
        })
        .catch(err => {
          console.log(`error: ${err.message}`);
          // dispatch(registerFailed(err));
        });
      axios
        .get(`${HOST}${USERS_URI}/${decodedHeader.sub}`, generateHeaders())
        .then(res => {
          this.setState({ userInfo: res.data });
        })
        .catch(err => {
          console.log(`error: ${err.message}`);
          // dispatch(registerFailed(err));
        });
    }
  }

  render() {
    const { user } = this.props || {};
    const { userId, portfolio, userInfo } = this.state
    let loggedIn = user && user.token

    return loggedIn ? (
      <Settings logout={e => this.onClick(e)} userId={userId} portfolio={portfolio} userInfo={userInfo}/>
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

export default connect(mapStateToProps, matchDispatchToProps)(SettingsPage);
