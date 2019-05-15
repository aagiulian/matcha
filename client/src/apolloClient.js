import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { ApolloLink, split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { getMainDefinition } from "apollo-utilities";
import { WebSocketLink } from "apollo-link-ws";
import { setContext } from "apollo-link-context";
import { onError } from "apollo-link-error";
import { withClientState } from "apollo-link-state";
import { createUploadLink } from "apollo-upload-client";

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

function getCurrentLocation(options) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      ({ code, message }) =>
        reject(
          Object.assign(new Error(message), { name: "PositionError", code })
        ),
      options
    );
  });
}

async function getLocation() {
  let location = undefined;
  if (navigator.geolocation) {
    try {
      location = await getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    } catch (e) {
      console.log("location error:", e);
    }
  }
  return location;
}

const authLink = setContext((_, { headers }) => {
  const authToken = sessionStorage.getItem("token");
  const context = {
    headers: {
      ...headers,
      Authorization: authToken ? `Bearer ${authToken}` : "",
      location: getLocation()
    }
  };
  return context;
});

// const httpLink = new HttpLink({ uri: "http://localhost:4000" });
// const httpLink = new HttpLink({
//   uri: `http://${process.env.REACT_APP_API_HOST}/`
// });
const uploadLink = createUploadLink({
  uri: `http://${process.env.REACT_APP_API_HOST}/`
});

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
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  uploadLink
);

const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, stateLink, webLink]),
  cache
});

export default client;
