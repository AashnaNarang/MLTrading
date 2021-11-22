import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Redirect, withRouter } from 'react-router-dom';

import { register } from '../api/register.api';
import Register from '../components/Register.js';

class RegisterPage extends Component {
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
      initial_cash_amount: 0
    };

    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  onChange = e => {
    this.setState({ [e.target.id]: e.target.value });
  };

  onClick = e => {
    e.preventDefault();
    const { email, password, initial_cash_amount } = this.state;
    this.props.register({ email, password, initial_cash_amount });
  };

  render() {
    const { email, password, cash } = { ...this.state };
    const { user } = this.props || {};
    const { token } = user;

    return token ? (
      <Redirect to="/" user={user} />
    ) : (
      <Register
        onChange={e => this.onChange(e)}
        onClick={e => this.onClick(e)}
        email={email}
        password={password}
        initial_cash_amount = {cash}
      />
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
  return bindActionCreators({ register }, dispatch);
}

export default connect(
  mapStateToProps,
  matchDispatchToProps
)(withRouter(RegisterPage));
