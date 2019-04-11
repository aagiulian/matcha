import { ApolloProvider } from "react-apollo";
import { ApolloProvider as ApolloProviderHooks } from "react-apollo-hooks";

import Signup from "./components/Signup";
import Login from "./components/Login";
import Logout from "./components/Logout";
import React, { useState } from "react";
import client from "./apolloClient";

import "./index.css";
import "./App.css";

const App = () => {
  const [token, setToken] = useState(sessionStorage.getItem("token"));

  const setTokenInStorage = token => {
    sessionStorage.setItem("token", token);
  };

  return (
    <ApolloProvider client={client}>
      <ApolloProviderHooks client={client}>
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
      </ApolloProviderHooks>
    </ApolloProvider>
  );
};

export default App;
