import { ApolloProvider } from "react-apollo";
import { ApolloProvider as ApolloProviderHooks } from "react-apollo-hooks";

import Signup from "./components/Signup";
import Login from "./components/Login";
import React from "react";
import client from "./apolloClient";

import "./index.css";
import "./App.css";

const App = () => (
  <ApolloProvider client={client}>
    <ApolloProviderHooks client={client}>
      <div>
        <h2>Matcha soon to be released 🚀</h2>
        <Signup />
        <br />
        <br />
        <Login />
      </div>
    </ApolloProviderHooks>
  </ApolloProvider>
);

export default App;
