import React from "react";
// import loaderPage from '../images/loaderPage.gif';
// import loaderGif from "../images/loaderGif.gif";
import { Spinner } from "reactstrap";

const LoadingPage = ({ loadingText = "" }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: "100",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "5px",
          width: "150px",
          height: "150px",
          marginTop: "1rem",
          zIndex: "110",
        }}
      >
        <Spinner />
        {loadingText && <h5 className="mt-2">{loadingText}</h5>}
        {/* <img
          src={loaderGif}
          alt='loader'
          style={{
            height: '7rem',
            width: '7rem',
            // backgroundColor: 'rgba(0, 0, 0, 0.2)',
          }}
        /> */}
      </div>
    </div>
  );
};

export default LoadingPage;
