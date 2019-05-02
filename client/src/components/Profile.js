import React, { useState } from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo-hooks";
import { useQuery } from "react-apollo-hooks";
import axios from "axios";
import { Link } from "react-router-dom";
import Formol, { Field } from "formol/lib/formol";

const UPDATEME = gql`
  mutation UpdateMe($input: UpdateMeInput!) {
    updateme(input: $input) {
      success
      token
    }
  }
`;
const ME = gql`
  query Me {
    me {
      username
      lastname
    }
  }
`;

export default function Profile(props) {
  const { data, error, loading } = useQuery(ME);
  if (loading) {
    return <div>Loading</div>;
  }
  console.log(data);
  return (
    <Formol item={data}>
      <Field>Username</Field>
      <Field>Lastname</Field>
    </Formol>
  );
}
