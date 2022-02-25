import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import GreyBox from './GreyBox';
import '../Settings.css';
import axios from "axios";
import {HOST, PORTFOLIO_URI, USERS_URI} from "../constants";
import {generateHeaders} from "../api/utilities";

class Settings extends Component {

    constructor(props) {
      super(props);

      this.state = {
        isEdit: false,
        initialPortfolio: {},
        initialUserInfo: {},
        name: '',
        email: '',
        transactionCost: 0,
        initialFreeCash: 0,
        currency: '',
      }
    }

  componentDidUpdate(prevProps) {
    const {portfolio, userInfo} = this.props
    if(JSON.stringify(prevProps.userInfo) !== JSON.stringify(userInfo)) {
      this.setState({
        initialUserInfo: userInfo,
        name: userInfo.name,
        email: userInfo.email,
      })
    }
    if(JSON.stringify(prevProps.portfolio) !== JSON.stringify(portfolio)) {
      this.setState({
        initialPortfolio: portfolio,
        transactionCost: portfolio.transactionCost,
        initialFreeCash: portfolio.initialFreeCash,
        currency: portfolio.currency,}
      )
    }

  }


    editClick = () => {
      this.setState({isEdit: true})
    }

    cancelClick = () => {
      const {initialPortfolio, initialUserInfo} = this.state
      this.setState({isEdit: false, name: initialUserInfo.name, email: initialUserInfo.email,
        transactionCost: initialPortfolio.transactionCost
      })
    }

    saveClick = () => {
      const {userId} = this.props
      const {name, email, transactionCost, initialPortfolio, initialUserInfo} =  this.state;

      axios
        .patch(`${HOST}${PORTFOLIO_URI}/${initialPortfolio.id}`, {
          transactionCost: parseFloat(transactionCost)},
          generateHeaders())
        .then(res => {
          this.setState({initialPortfolio: {...initialPortfolio, transactionCost: transactionCost}})
        })
        .catch(err => {
          console.log(`error: ${err.message}`);
          // dispatch(registerFailed(err));
        });
      axios
        .patch(`${HOST}${USERS_URI}/${userId}`, {name, email}, generateHeaders())
        .then(res => {
          this.setState({initialUserInfo: {...initialUserInfo, name: name, email: email}})
        })
        .catch(err => {
          console.log(`error: ${err.message}`);
          // dispatch(registerFailed(err));
        });
      this.setState({isEdit: false})
    }

    onChange = (field) => (e) => this.setState({[field]: e.target.value})

    render() {
      const {logout} = this.props;
      const {isEdit, name, email, transactionCost, initialFreeCash, currency} =  this.state;

      const inputClassName = isEdit ? "" : "settings-readonly-input";
      const alignItems = isEdit ? 'flex-end' : 'flex-start';

      const content = (
        <div className="settings-flex-row" style={{margin: "24px", alignItems: alignItems}}>
          <div style={{flex: 4, marginRight: "24px"}}>
            <div className="settings-flex-row settings-field-row">
              <div className="settings-field-name"> Name </div>
              <TextField className="settings-field-value"  InputProps={{ disableUnderline: true, readOnly: !isEdit,
                value: name, onChange: this.onChange("name")}} inputProps={{className: inputClassName}}/>
            </div>
            <div className="settings-flex-row settings-field-row">
              <div className="settings-field-name"> Email </div>
              <TextField className="settings-field-value"  InputProps={{ disableUnderline: true, readOnly: !isEdit,
                value: email, onChange: this.onChange("email") }} inputProps={{className: inputClassName}}/>
            </div>
            <div className="settings-flex-row settings-field-row">
              <div className="settings-field-name"> Transaction Fee </div>
              <TextField className="settings-field-value"  InputProps={{ disableUnderline: true, readOnly: !isEdit,
                value: transactionCost, onChange: this.onChange("transactionCost") }}
                         inputProps={{className: inputClassName}}/>
            </div>
            <div className="settings-flex-row settings-field-row">
              <div className="settings-field-name"> Initial Free Cash Amount </div>
              <TextField className="settings-field-value"  InputProps={{ disableUnderline: true, readOnly: true,
                value: initialFreeCash, onChange: this.onChange("initialFreeCash") }}
                         inputProps={{className: 'settings-readonly-input'}}/>
            </div>
            <div className="settings-flex-row settings-field-row">
              <div className="settings-field-name"> Currency </div>
              <TextField className="settings-field-value"  InputProps={{ disableUnderline: true, readOnly: true,
                value: currency, onChange: this.onChange("currency") }}
                         inputProps={{className: 'settings-readonly-input'}}/>
            </div>
          </div>
          {isEdit ?
            <>
              <Button className="settings-button" variant="contained" onClick={this.cancelClick}>Cancel</Button>
              <Button className="settings-button" variant="contained" onClick={this.saveClick}>Save</Button>
            </> :
            <Button className="settings-button" variant="contained" onClick={this.editClick}>Edit</Button>
          }


        </div>
      )

      return (
        <>
          <div className="flex-col main">
            <h2 className="settings-hello"> Hello, view or edit your settings below  </h2>
            <GreyBox title="Settings" content={content} />
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
}


export default Settings;
