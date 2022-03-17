import React from "react";
import { Link } from 'react-router-dom';
import logo from './main_image.jpg'
import '../Register.css';

const Register = props => {
    return (
        <div className="container-register-tab">
            <div className="main-image">
                <img src={logo} alt="" />
            </div>

            <div className="login-page-container-register-tab">

                <div className="login-register-container-register-tab">
                    <div className="login-text-button-register-tab">
                        <Link to="/login">
                            <button
                                type="login-option"
                            >
                                <b>Login</b>
                            </button>
                        </Link>
                    </div>

                    <div className="register-text-button-register-tab">
                        <Link to="/register">
                            <button type="login-option">
                                <b>Register</b>
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="name-input-field-register-tab">
                    Name
                    <input
                        onChange={props.onChange}
                        value={props.name.value}
                        id="name"
                        type="text"
                        name="name"
                    />
                </div>

                <div className="email-input-field-register-tab">
                    Email
                    <input
                        onChange={props.onChange}
                        value={props.email.value}
                        id="email"
                        type="email"
                        name="email"
                    />
                </div>

                <div className="password-input-field-register-tab">
                    Password
                    <input
                        onChange={props.onChange}
                        value={props.password.value}
                        input type="password"
                        id="password"
                        type="password"
                        name="password"
                    />
                    <span className="validity"></span>
                    <label>Must be at least 8 characters, include 1 number, and 1 letter.</label>
                </div>

                <div className="re-enter-password-input-field-register-tab">
                    Re-enter Password
                    <input
                        onChange={props.onChange}
                        value={props.confirmPassword.value}
                        input type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                    />
                    <span className="validity"></span>
                    <label>Re-enter the same password</label>
                </div>

                <div className="initial-cash-amount-input-field-register-tab">
                    Initial Cash Amount
                    <input
                        onChange={props.onChange}
                        value={props.initial_cash_amount.value}
                        id="initial_cash_amount"
                        name="initial_cash_amount"
                    />
                </div>

                <div className="sign-up-button-register-tab">
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
                        Sign Up
                    </button>
                </div>
            </div>

        </div>


    );
};
export default Register;