import React, { useState } from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo-hooks";
import PropTypes from "prop-types";
import axios from "axios";
import { Link } from "react-router-dom";

const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success
      token
    }
  }
`;

export default function Login(props) {
  const [errors, setErrors] = useState(null);
  const [userCache, setUserCache] = useState(null);
  let password;
  let username;
  let usernameCache;

  console.log("hello host:", `http://${process.env.REACT_APP_HOST}:30078/sendVerification`);
  console.log(props);
  console.log(props.setToken);
  const Login = useMutation(LOGIN);
  console.log("LOL", errors);
  if (
    errors &&
    errors.message.includes("Your email hasn't been verified yet.")
  ) {
    return (
      <div>
        {errors.username + " :(  "}
        {errors.message}
        <br />
        Check your emails or click the
        <button
          onClick={() =>
            axios.get(
              `http://${process.env.REACT_APP_HOST}:30078/sendVerification/${errors.username}`
            )
          }
        >
          link
        </button>
        to resend email verification.
        <br />
      </div>
    );
  }
  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (!username.value || !password.value) {
            setErrors("Missing field.");
          } else {
            usernameCache = username.value;
            Login({
              variables: {
                input: { username: username.value, password: password.value }
              }
            })
              .then(res => {
                if (res.data.login.success === true) {
                  props.setToken(res.data.login.token);
                }
              })
              .catch(res => {
                console.log("LALALAL", username.value);
                setErrors({
                  message: res.graphQLErrors.map(error => error.message),
                  username: usernameCache
                });
              });
            password.value = "";
            username.value = "";
          }
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
      <br />
      {errors ? errors.message : null}
      <Link to="/resetPassword" className="ml1 no-underline black">
        Reset password
      </Link>
    </div>
  );
}

