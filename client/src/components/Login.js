import React from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo-hooks";
import PropTypes from "prop-types";

const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success
      token
    }
  }
`;

export default function Login(props) {
  let password;
  let username;

  console.log(props);
  console.log(props.setToken);
  const Login = useMutation(LOGIN);
  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          Login({
            variables: {
              input: { username: username.value, password: password.value }
            }
          }).then(res => {
            if (res.data.login.success === true) {
              props.setToken(res.data.login.token);
            }
          });
          password.value = "";
          username.value = "";
        }}
      >
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
        <button type="submit">Login User</button>
      </form>
    </div>
  );
}

Login.propTypes = {
  setToken: PropTypes.func.isRequired
};
