import React, { Component, useReducer } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Redirect, withRouter } from 'react-router-dom';

import { register } from '../api/register.api';
import Register from '../components/Register.js';
import Alert from '@material-ui/lab/Alert';

class RegisterPage extends Component {
  constructor() {
    super();
    this.state = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
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
    const { name, email, password, confirmPassword, initial_cash_amount } = this.state;
    if (password !== confirmPassword) {
      alert("Password's do not match")
    }
    else {
      this.props.register({ name, email, password, initialFreeCash: parseInt(initial_cash_amount) });
    }
  };

  render() {
    const { name, email, password, confirmPassword, initial_cash_amount } = { ...this.state };
    const { user } = this.props || {};
    const { token } = user;

    return token ? (
      <Redirect to="/" user={user} />
    ) : (
      <React.Fragment>
        {!!user.errors &&
          <Alert severity="error">
            {user.errors.data.message}
          </Alert>
        }
        <Register
          onChange={e => this.onChange(e)}
          onClick={e => this.onClick(e)}
          name={name}
          email={email}
          password={password}
          confirmPassword={confirmPassword}
          initial_cash_amount={initial_cash_amount}
        />
      </React.Fragment>
    );
  }
}

// Store
function mapStateToProps(state) {
  return {
    user: state.user
  };
}

function matchDispatchToProps(dispatch) {
  return bindActionCreators({ register }, dispatch);
}

export default connect(
  mapStateToProps,
  matchDispatchToProps
)(withRouter(RegisterPage));
