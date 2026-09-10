import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import withRouter from '../../Components/Common/withRouter';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { removeAllStorage } from '../Edge/utils/utilFunc';
import { recordSessionLogout, SESSION_TOKEN_KEY } from '../Edge/apis';

const Logout = (props) => {
  const token = Cookies.get('userJWT');

  async function logout() {
    // Close the session record first, so the history shows a logout rather
    // than the sweep later marking it merely expired. Awaited so the request
    // is not cut off by the redirect, but never allowed to block signing out.
    const sessionToken = window.localStorage.getItem(SESSION_TOKEN_KEY);

    if (sessionToken) {
      try {
        await recordSessionLogout(sessionToken);
      } catch (error) {
        console.error('error', error);
      }
    }

    Cookies.remove('userJWT');
    Cookies.remove('userId');

    removeAllStorage();
    window.location.href = '/';
  }

  useEffect(() => {
    logout();
  }, [token]);

  if (!token) {
    return <Navigate to='/login' />;
  }

  return <></>;
};

Logout.propTypes = {
  history: PropTypes.object,
};

export default withRouter(Logout);
