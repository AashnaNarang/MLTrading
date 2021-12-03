import axios from 'axios';
import { registerSuccessfully, registerFailed } from '../store/actions/auth.action';
import { HOST, REGISTER_URI, USER_TOKEN } from '../constants';
import { setTokenToLocalStorage } from '../utils';

export const register = userData => dispatch => {
    axios
      .post(`${HOST}${REGISTER_URI}`, userData)
      .then(res => {
        // Set userToken to Local Storage
        setTokenToLocalStorage(USER_TOKEN, res.data.token).then(() => {
          dispatch(registerSuccessfully(res.data));
          window.location.href = '/';
        });
      })
      .catch(err => {
        console.log(`error: ${err.message}`);
        dispatch(registerFailed(err));
      });
  };