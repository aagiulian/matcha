import React from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo-hooks";
import PropTypes from "prop-types";

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      success
      token
    }
  }
`;

export default function Login(props) {
  let email;
  let password;

  console.log(props);
  console.log(props.setToken);
  const Login = useMutation(LOGIN);
  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          Login({
            variables: { email: email.value, password: password.value }
          }).then(res => {
            if (res.data.login.success === true) {
              props.setToken(res.data.login.token);
            }
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

Login.propTypes = {
  setToken: PropTypes.func.isRequired
};
