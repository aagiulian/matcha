import React from "react";
import { useSubscription } from "react-apollo-hooks";
import gql from "graphql-tag";

const USER_LOGGED_SUBSCRIPTION = gql`
  subscription userLogged {
    userLogged
  }
`;

export default function UserLogged() {
  const { data, error, loading } = useSubscription(USER_LOGGED_SUBSCRIPTION);

  if (loading)
    return <div>Loading...</div>

  if (error)
    return <div>Error! {error.message}</div>

  return <div>Last user logged: {data.userLogged}</div>
}
