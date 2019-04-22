import React from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo-hooks";
import Formol, { Field } from "formol/lib/formol";

const SIGNUP = gql`
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      email
    }
  }
`;

export default function Signup() {
  const signup = useMutation(SIGNUP);

  return (
    <div>
      <Formol
        onSubmit = {(input) => {
          signup({
            variables: {
              input
            }
          }).then(result => console.log("signup then:",result))}}
      >
        <Field>Username</Field>
        <Field type="email">Email</Field>
        <Field>Password</Field>
      </Formol>

      <br/>
    </div>
  );
}
