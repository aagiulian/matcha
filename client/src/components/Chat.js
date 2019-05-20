import { Subscriptions } from "react-apollo";
import React from "react";
import gql from "graphql-tag";
import { useSubscription } from "react-apollo-hooks";

const NEWMESSAGES = gql``;

const Chat = () => {
  const { data, error, loading } = useSubscription(NEWMESSAGES);
  return <div />;
};

export default Chat;
