import React, { useState } from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo-hooks";
import { useQuery } from "react-apollo-hooks";
import axios from "axios";
import { Link } from "react-router-dom";
import Formol, { Field } from "formol/lib/formol";
import "formol/lib/default.css";

const UPDATEME = gql`
  mutation UpdateMe($input: UpdateMeInput!) {
    updateMe(input: $input) {
      success
      token
    }
  }
`;
const ME = gql`
  query Me {
    me {
      profileInfo {
        username
        lastname
      }
    }
  }
`;

export default function Profile(props) {
  const updateMe = useMutation(UPDATEME);
  const { data, error, loading } = useQuery(ME);
  let profile;
  if (loading) {
    return <div>Loading</div>;
  } else if (!error) {
    profile = data.me.profileInfo;
  }
  console.log(data);
  return (
    <Formol
      item={profile}
      onSubmit={async input => {
        console.log("Input UpdateMe", input);
        return await updateMe({
          variables: {
            input: input
          }
        })
          .then(result => console.log("signup then:", result))
          .catch(e =>
            e.graphQLErrors
              .map(err => err.extensions.exception.invalidArgs)
              .reduce((acc, error) => Object.assign(acc, error), {})
          );
      }}
    >
      <Field>Username</Field>
      <Field>Firstname</Field>
      <Field>Lastname</Field>
      <Field>Email</Field>
      <Field>Password</Field>
      <Field>Gender</Field>
      <Field>Sexual Orientation</Field>
      <Field>Bio</Field>
      <Field>Hashtag</Field>
      <Field>Images</Field>
    </Formol>
  );
}
