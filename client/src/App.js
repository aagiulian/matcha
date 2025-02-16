import React from "react";
import Signup from "./components/Signup";
import Login from "./components/Login";
//import Logout from "./components/Logout";
import Maine from "./components/Maine";
import Verify from "./components/Verify";
import Profile from "./components/Profile";
import ForgotPassword from "./components/ForgotPassword";
import Upload from "./components/Upload";
import Chat from "./components/Chat";

import Header from "./components/Header";
import { Switch, Route } from "react-router-dom";
import "./index.css";
import "./App.css";
import ChangePassword from "./components/ChangePassword";

const App = () => {
  const token = sessionStorage.getItem("token");

  console.log(
    "process.env.REACT_APP_API_HOST:",
    process.env.REACT_APP_API_HOST
  );
  console.log("process.env:", process.env);

  return (
    <div>
      <div className="center w85">
        <Header className="header" />
        <div className="ph3 pv1">
          <Switch>
            {/* <Route exact path="/" component={App} /> */}
            <Route exact path="/signup" component={Signup} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/profile" component={Profile} />
            <Route exact path="/verify/:emailToken" component={Verify} />
            <Route exact path="/upload" component={Upload} />
            <Route exact path="/chat" component={Chat} />
            <Route exact path="/forgotPassword" component={ForgotPassword} />
            <Route
              exact
              path="/changePassword/:token"
              component={ChangePassword}
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
