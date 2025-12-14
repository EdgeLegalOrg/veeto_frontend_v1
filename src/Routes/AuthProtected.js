import React from "react";
import { Navigate, Route } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const AuthProtected = (props) => {
  const token = Cookies.get("userJWT");
  const currentTime = Date.now() / 1000;

  const cleaningFunc = () => {
    Cookies.remove("userId");
    Cookies.remove("userJWT");
    window.localStorage.clear();
  };

  const checkupFunc = () => {
    let isLoggedOut = window.sessionStorage.getItem("alreadyLoggedOut");
    if (isLoggedOut) {
      cleaningFunc();
    } else {
      window.sessionStorage.setItem("alreadyLoggedOut", true);
      cleaningFunc();
    }
  };

  if (token && jwtDecode(token).exp > currentTime) {
    return <>{props.children}</>;
  } else {
    checkupFunc();
    return (
      <Navigate to={{ pathname: "/login", state: { from: props.location } }} />
    );
  }
};
const AccessRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        return (
          <>
            {" "}
            <Component {...props} />{" "}
          </>
        );
      }}
    />
  );
};

export { AuthProtected, AccessRoute };
