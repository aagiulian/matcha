import React from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo-hooks";
import Formol, { Field } from "formol/lib/formol";
import "formol/lib/default.css";

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
        onSubmit={input => {
          signup({
            variables: {
              input: input
            }
          }).then(result => console.log("signup then:", result));
        }}
      >
        <Field required={true}>Username</Field>
        <Field required={true} type="email">
          Email
        </Field>
        <Field required={true} type="password">
          Password
        </Field>
      </Formol>

      <br />
    </div>
  );
}

//mettre le password en password strength
