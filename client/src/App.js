import './App.css';
import Signup from './components/Signup'
import Login from './components/Login'
import React from 'react';
import './index.css';
import { ApolloProvider } from "react-apollo";
import { ApolloProvider as ApolloProviderHooks } from "react-apollo-hooks";
import ApolloClient from 'apollo-boost';

const client = new ApolloClient({
    uri: "http://localhost:4000"
});

const App = () => (
    <ApolloProvider client={client}>
        <ApolloProviderHooks client={client}>
            <div>
                <h2>My first Apollo app 🚀</h2>
                <Signup />
                <br />
                <br />
                <Login />
            </div>
        </ApolloProviderHooks>
    </ApolloProvider>
);

export default App;
