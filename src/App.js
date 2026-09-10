import React from "react";
import "./App.css";
//import Scss
import "./assets/scss/themes.scss";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
//imoprt Route
import Route from "./Routes";
import { RouteHistoryProvider } from "./contexts/RouteHistoryContext";

function App() {
  return (
    <React.Fragment>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <RouteHistoryProvider>
        <Route />
      </RouteHistoryProvider>
    </React.Fragment>
  );
}

export default App;
