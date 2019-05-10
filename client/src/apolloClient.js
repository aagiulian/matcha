import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { ApolloLink, split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { getMainDefinition } from "apollo-utilities";
import { WebSocketLink } from "apollo-link-ws";
import { setContext } from "apollo-link-context";
import { onError } from "apollo-link-error";
import { withClientState } from "apollo-link-state";

const cache = new InMemoryCache();

const stateLink = withClientState({
  cache,
  resolvers: {},
  defaults: {}
});

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, path }) =>
      console.log(`[GraphQL error]: Message: ${message}, Path: ${path}`)
    );
  }

  if (networkError) {
    console.log(
      `[Network error ${operation.operationName}]: ${networkError.message}`
    );
  }
});

const authLink = setContext((_, { headers }) => {
  const authToken = sessionStorage.getItem("token");
  const context = {
    headers: {
      ...headers,
      Authorization: authToken ? `Bearer ${authToken}` : ""
    }
  };
  return context;
});

// const httpLink = new HttpLink({ uri: "http://localhost:4000" });
const httpLink = new HttpLink({ uri: `http://${process.env.REACT_APP_API_HOST}/` });

const wsLink = new WebSocketLink({
  uri: `ws://${process.env.REACT_APP_API_HOST}/graphql`,
  options: {
    reconnect: true,
    connectionParams: {
      authToken: sessionStorage.getItem("token")
    }
  }
});


const webLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (definition.kind === 'OperationDefinition'
            && definition.operation === 'subscription');
  },
  wsLink,
  httpLink
);


const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, stateLink, webLink]),
  cache
});

export default client;
