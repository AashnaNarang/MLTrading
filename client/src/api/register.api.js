import axios from 'axios';
import { registerSuccessfully, registerFailed } from '../store/actions/auth.action';
import { HOST, REGISTER_URI, USER_TOKEN, CREATE_PORTFOLIO_URI } from '../constants';
import { setTokenToLocalStorage } from '../utils';
import { generateHeaders } from './utilities';

export const register = userData => dispatch => {
  let initialFreeCash = userData.initialFreeCash;
  delete userData.initialFreeCash;
    axios
      .post(`${HOST}${REGISTER_URI}`, userData)
      
      .then(res => {
        // Set userToken to Local Storage
        setTokenToLocalStorage(USER_TOKEN, res.data.tokens.access.token);
        return res
      })
      
      .then(response => {
        let portfolioData = {
          user: response.data.user.id,
          initialFreeCash: initialFreeCash, 
        };
        
        axios
          .post(`${HOST}${CREATE_PORTFOLIO_URI}`, portfolioData, generateHeaders())
          
          .then(res => {
            dispatch(registerSuccessfully(res.data));
            window.location.href = '/';
          })
          
          .catch(err => {
            console.log(`error: ${err.message}`);
            dispatch(registerFailed(err));
          });
      })
      .catch(err => {
        console.log(`error: ${err.message}`);
        dispatch(registerFailed(err));
      });
  };