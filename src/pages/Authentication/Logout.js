import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import withRouter from '../../Components/Common/withRouter';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { removeAllStorage } from '../Edge/utils/utilFunc';

const Logout = (props) => {
  const token = Cookies.get('userJWT');
  function logout() {
    toast.success('You are Logged out', { autoClose: 2000 });

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
