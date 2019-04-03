import React from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo-hooks";

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user
    }
  }
`;

export default function Login() {
  let email;
  let password;

  const Login = useMutation(LOGIN);
  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          Login({
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
        <button type="submit">Login User</button>
      </form>
    </div>
  );
}
