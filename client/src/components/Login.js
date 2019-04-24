import React, { useState } from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo-hooks";
import axios from "axios";
import { Link } from "react-router-dom";
import Formol, { Field } from "formol/lib/formol";
import "formol/lib/default.css";

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
  //const [userCache, setUserCache] = useState(null);

  //console.log("hello host:", `http://${process.env.REACT_APP_HOST}:30078/sendVerification`);
  //console.log(props);
  //console.log(props.setToken);
  const login = useMutation(LOGIN);
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
              `http://${process.env.REACT_APP_HOST}:30078/sendVerification/${
                errors.username
              }`
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
      <Formol
        onSubmit={input => {
          if (!input.username || !input.password) {
            setErrors("Missing field.");
          } else {
            login({
              variables: {
                input: input
              }
            })
              .then(res => {
                if (res.data.login.success === true) {
                  //props.setToken(res.data.login.token);
                  sessionStorage.setItem("token", res.data.login.token);
                }
              })
              .catch(res => {
                console.log("LALALAL", input.username);
                setErrors({
                  message: res.graphQLErrors.map(error => error.message),
                  username: input.username
                });
              });
          }
        }}
      >
        <Field required={true}>Username</Field>
        <Field required={true} type="password">
          Password
        </Field>
      </Formol>
      {errors ? errors.message : null}
      <Link to="/resetPassword" className="ml1 no-underline black">
        Reset password
      </Link>
    </div>
  );
}
