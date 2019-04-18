import React from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo-hooks";

const SIGNUP = gql`
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      email
    }
  }
`;

export default function Signup() {
  let email;
  let password;
  let username;

  const Signup = useMutation(SIGNUP);
  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          Signup({
            variables: {
              input: {
                email: email.value,
                password: password.value,
                username: username.value
              }
            }
          }).then(result => console.log(result));
          email.value = "";
          password.value = "";
          username.value = "";
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

        <br />
        <input
          ref={node => {
            username = node;
          }}
          type="username"
          placeholder="Username"
          name="username"
        />
        <br />
        <input
          ref={node => {
            password = node;
          }}
          type="password"
          placeholder="Password"
          name="password"
        />
        <br />
        <button type="submit">Signup User</button>
      </form>
    </div>
  );
}
