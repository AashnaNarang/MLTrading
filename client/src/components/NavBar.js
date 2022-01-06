import React from 'react';
import { Link } from 'react-router-dom';

const Home = props => {
    return (
    localStorage.getItem('token') ? (
        <MainNav>
          <Link
            to="/"
            onClick={props.logout}
            style={{
            color: 'black',
            letterSpacing: '1.5px',
            }}
            className="btn-link hoverable "
          >
            Logout
          </Link>
        </MainNav> 
        ) : (null)
      
    )
}