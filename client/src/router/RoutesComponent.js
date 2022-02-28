import React, { Component } from 'react';
import { Route } from 'react-router-dom';

// Page
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import SettingsPage from "../pages/SettingsPage";

class RoutesComponent extends Component {
  render() {
    return (
      <div>
        <Route exact path="/" component={HomePage} />
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/register" component={RegisterPage} />
        <Route exact path="/settings" component={SettingsPage} />
      </div>
    );
  }
}
export default RoutesComponent;
