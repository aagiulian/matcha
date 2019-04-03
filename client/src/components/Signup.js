import React from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo-hooks";

const SIGNUP = gql`
  mutation Signup($email: String!, $password: String!) {
    signup(email: $email, password: $password) {
      token
      user
    }
  }
`;

export default function Signup() {
  let email;
  let password;

  const Signup = useMutation(SIGNUP);
  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          Signup({
            variables: { email: email.value, password: password.value }
          });
          email.value = "";
          password.value = "";
        }}
      >
        <input
          ref={node => {
            email = node;
          }}
          type="email"
          placeholder="Email"
          name="email"
        />
        <input
          ref={node => {
            password = node;
          }}
          type="password"
          placeholder="Password"
          name="password"
        />
        <button type="submit">Signup User</button>
      </form>
    </div>
  );
}
