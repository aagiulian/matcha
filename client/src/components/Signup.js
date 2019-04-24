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
        onSubmit={async input => {
          return await signup({
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
        <Field required>Username</Field>
        <Field
          required
          // pattern=""
          // validityErrors={({ patternMismatch }) => {
          //   if (patternMismatch) {
          //     return "Please provide a valid email.";
          //   }
          // }}
          // NEEDS TO BE PUT IN LOWERCASE TO AVOID DUPLICATE IN DB
        >
          Email
        </Field>
        <Field required type="password">
          Password
        </Field>
        <Field required>Name</Field>
        <Field required>Surname</Field>
      </Formol>

      <br />
    </div>
  );
}

//mettre le password en password strength
