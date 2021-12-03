/* eslint-disable import/prefer-default-export */
import {
  SET_USER_TOKEN,
  LOGIN_FAILED,
  LOGIN_SUCCESSFULLY,
  LOGOUT,
  REGISTER_FAILED,
  REGISTER_SUCCESSFULLY,
} from '../../constants';

export const loginFailed = error => ({
  type: LOGIN_FAILED,
  payload: error,
});

export const registerFailed = error => ({
  type: REGISTER_FAILED,
  payload: error,
});

export const loginSuccessfully = user => ({
  type: LOGIN_SUCCESSFULLY,
  payload: user,
});

export const registerSuccessfully = user => ({
  type: REGISTER_SUCCESSFULLY, 
  payload: user
});

export const logout = () => ({
  type: LOGOUT,
});

export const setUserToken = user => ({
  type: SET_USER_TOKEN,
  payload: user,
});
