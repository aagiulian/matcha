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
    me(input: $input) {
      success
      token
    }
  }
`;

export default function Profile(props) {
  return (
    <Formol>
      <Field>Username</Field>
      <Field>Password</Field>
    </Formol>
  );
}
