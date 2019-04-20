import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { HttpLink } from "apollo-link-http";
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
  let JWT = sessionStorage.getItem("token");
  const context = {
    headers: {
      ...headers,
      Authorization: JWT ? `Bearer ${JWT}` : ""
    }
  };
  return context;
});

// const httpLink = new HttpLink({ uri: "http://localhost:4000" });
const httpLink = new HttpLink({ uri: `http://${process.env.REACT_APP_HOST}:30077/` });

const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, stateLink, httpLink]),
  cache
});

export default client;
