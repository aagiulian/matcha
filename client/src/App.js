import Signup from "./components/Signup";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Verify from "./components/Verify";
import ResetPassword from "./components/ResetPassword";
import React, { useState } from "react";

import Header from "./components/Header";
import { Switch, Route } from "react-router-dom";
import "./index.css";
import "./App.css";

const App = () => {
  const [token, setToken] = useState(sessionStorage.getItem("token"));

  const setTokenInStorage = token => {
    sessionStorage.setItem("token", token);
  };

  return (
    <div>
      <div className="center w85">
        <Header />
        <div className="ph3 pv1 background-gray">
          <Switch>
            <Route exact path="/signup" component={Signup} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/verify/:emailToken" component={Verify} />
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
            <Logout />
            <Signup />
          </div>
        ) : (
          <div>
            <Signup />
            <br />
            <br />
            <Login setToken={setTokenInStorage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
