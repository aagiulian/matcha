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
        onSubmit={async (input) => {
          let ret = null;

          if (!input.username || !input.password) {
            setErrors("Missing field.");
          } else {
            try {
	      ret = await login({
		variables: {
		  input: input
		}
	      });
              console.log("normal path:", ret);
              if (ret.data.login.success === true) {
                sessionStorage.setItem("token", ret.data.login.token);
                return ;
              }
            } catch (e) {
                console.log("catch:", e);
                const serverErrors = e.graphQLErrors
                      .map(err => err.extensions.exception.invalidArgs)
                      .reduce((acc, error) => Object.assign(acc, error), {});
                setErrors({
                  message: e.graphQLErrors.map(error => error.message),
                  username: input.username
                });
                console.log("serverErrors:", serverErrors);
                ret = serverErrors;
            }
          }
          return ret;
        }}
      >
        <Field required>Username</Field>
        <Field required type="password">
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
