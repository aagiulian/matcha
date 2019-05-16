import { Subscriptions } from "react-apollo";
import React from "react";
import gql from "graphql-tag";
import { useSuscribtions } from "react-apollo-hooks";

const NEWMESSAGES = gql``;

const Chat = () => {
  const { data, error, loading } = useSuscribtions(NEWMESSAGES);
  return <div />;
};

export default Chat;
