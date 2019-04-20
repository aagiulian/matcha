import Signup from "./components/Signup";
import Login from "./components/Login";
//import Logout from "./components/Logout";
import Maine from "./components/Maine";
import Verify from "./components/Verify";
import ResetPassword from "./components/ResetPassword";
import React, { useState } from "react";

import Header from "./components/Header";
import { Switch, Route } from "react-router-dom";
import "./index.css";
import "./App.css";
import ResetPasswordRequest from "./components/ResetPasswordRequest";

const App = () => {
  const token = sessionStorage.getItem("token");

  return (
    <div>
      <div className="center w85">
        <Header className=""/>
        <div className="ph3 pv1 background-gray">
          <Switch>
            <Route exact path="/signup" component={Signup} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/verify/:emailToken" component={Verify} />
            <Route exact path="/resetPassword" component={ResetPasswordRequest}/>
            <Route
              exact
              path="/resetPassword/:token"
              component={ResetPassword}
            />
          </Switch>
        </div>
      </div>
      <div>
        <h2>Matcha soon to be released </h2>
        {token ? (
          <div>
            <Maine />
          </div>
        ) : (
          <div>
            <Signup />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
