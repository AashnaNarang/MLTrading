import React from "react";
import { Link } from 'react-router-dom';
import logo from './main_image.jpg'
import '../Register.css';
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

const Register = props => {
    // Initialize a boolean state
    const [values, setValues] = React.useState({
        password: "",
        showPassword: false,
    });

    const handlePasswordChangeValue = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value });
    };

    const handleMouseDownClickEvent = (event) => {
        event.preventDefault();
    };

    const handleShowPasswordClick = () => {
        //Unsure about values -> try ...props.password.value if this fails
        setValues({ ...values, showPassword: !values.showPassword });
    };

    return (
        <div class="container-register-tab">
            <div class="main-image">
                <img src={logo} alt="" />
            </div>

            <div class="login-page-container-register-tab">

                <div class="login-register-container-register-tab">
                    <div class="login-text-button-register-tab">
                        <Link to="/login">
                            <button
                                type="login-option"
                            >
                                <b>Login</b>
                            </button>
                        </Link>
                    </div>

                    <div class="register-text-button-register-tab">
                        <Link to="/register">
                            <button type="login-option">
                                <b>Register</b>
                            </button>
                        </Link>
                    </div>
                </div>

                <div class="email-input-field-register-tab">
                    Email
                    <input
                        onChange={props.onChange}
                        value={props.email.value}
                        id="email"
                        type="email"
                        name="email"
                    />
                </div>

                <div class="password-input-field-register-tab">
                    Password
                    <input
                        onChange={props.onChange}
                        type={props.password.value}
                        input type="password"
                        pattern="(?=.*\d)(?=.*[a-zA-Z])(?=.*[0-9]).{8-15}"
                    />
                    <span class="validity"></span>
                    <p><small>Must be 8-15 characters, include 1 number, and 1 letter.</small></p>
                </div>

                <div class="re-enter-password-input-field-register-tab">
                    Re-enter Password
                    <input
                        onChange={props.onChange}
                        type={props.password.value}
                        input type="password"
                    />
                    <span class="validity"></span>
                    <p><small>Re-enter the same password</small></p>
                </div>

                <div class="initial-cash-amount-input-field-register-tab">
                    Initial Cash Amount
                    <input
                        onChange={props.onChange}
                        type={props.password.initial_cash_amount}
                    />
                </div>

                <div class="sign-up-button-register-tab">
                    <button
                        style={{
                            width: '150px',
                            borderRadius: '3px',
                            letterSpacing: '1.5px',
                            marginTop: '1rem',
                        }}
                        type="submit"
                        className="btn btn-large waves-effect waves-light hoverable black accent-3"
                    >
                        Sign Up
                    </button>
                </div>
            </div>

        </div>


    );
};
export default Register;