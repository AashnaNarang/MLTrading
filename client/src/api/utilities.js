
import { getTokenFromLocalStorage } from '../utils'
import { USER_TOKEN } from '../constants';


export const generateHeaders = () => {
    const token = getTokenFromLocalStorage(USER_TOKEN);
    return {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
    };
};