import React from "react";
import { Link } from 'react-router-dom';
import logo from './main_image.jpg'
import '../Login.css';
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

const Login = props => {
  // Initialize a boolean state
  const [values, setValues] = React.useState({
    password: "",
    showPassword: false,
  });

  const handleMouseDownClickEvent = (event) => {
    event.preventDefault();
  };

  const handleShowPasswordClick = () => {
    //Unsure about values -> try ...props.password.value if this fails
    setValues({ ...values, showPassword: !values.showPassword });
  };

  return (
    <div class="container">
      <div class="main-image">
        <img src={logo} alt="" />
      </div>

      <div class="login-page-container">

        <div class="login-register-container">
          <div class="login-text-button">
            <Link to="/login">
              <button
                type="login-option"
              >
                <b>Login</b>
              </button>
            </Link>
          </div>

          <div class="register-text-button">
            <Link to="/register">
              <button type="login-option">
                <b>Register</b>
              </button>
            </Link>
          </div>
        </div>

        <div class="email-input-field">
          Email
          <input
            onChange={props.onChange}
            value={props.email.value}
            id="email"
            type="email"
            name="email"
          />
        </div>

        <div class="password-input-field">
          Password
          {/* <input
            type={values.showPassword ? "text" : "password"}
            onChange={handlePasswordChangeValue("password")}
            value={values.password}
            id="password"
            type="password"
            name="password"
            >
            <button
              onClick={handleShowPasswordClick}
              onMouseDown={handleMouseDownClickEvent}
            >
              {values.showPassword ? <Visibility /> : <VisibilityOff />}
            </button>
          </input> */}
          <input
            type={values.showPassword ? "text" : "password"}
            onChange={props.onChange}
            value={props.password.value}
            id="password"
            name="password"
          />
          <button
            onClick={handleShowPasswordClick}
            onMouseDown={handleMouseDownClickEvent}
          >
            {values.showPassword ? <Visibility /> : <VisibilityOff />}
          </button>
        </div>

        <div class="forgot-password-field">
          <p class="forgot-password-button">
            Forgot Password? <Link to="/forgotpassword">Reset</Link>
          </p>
        </div>

        <div class="login-button">
          <button
            style={{
              width: '150px',
              borderRadius: '3px',
              letterSpacing: '1.5px',
              marginTop: '1rem',
            }}
            type="submit"
            onClick={props.onClick}
            className="btn btn-large waves-effect waves-light hoverable black accent-3"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};
export default Login;
