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

// const onSubmit = ({ username, password }) => {
//   if (!username || !password) {
//     setErrors("Missing field.");
//   } else {
//     login({
//       variables: {
//         input: { username, password }
//       }
//     })
//       .then(res => {
//         if (res.data.login.success === true) {
//           //props.setToken(res.data.login.token);
//           sessionStorage.setItem("token", res.data.login.token);
//         }
//       })
//       .catch(res => {
//         username = "toto";
//         setErrors({
//           message: res.graphQLErrors.map(error => error.message),
//           username: username
//         });
//       });
//   }
// };

export default function Login(props) {
  const [errors, setErrors] = useState(null);
  //const [userCache, setUserCache] = useState(null);

  //console.log("hello host:", `http://${process.env.REACT_APP_HOST}:30078/sendVerification`);
  //console.log(props);
  //console.log(props.setToken);
  const login = useMutation(LOGIN);
  console.log("LOL", errors);
  // ({ username, password }) => ({
  //   password: password === "cucu" ? "" : "Text1 must begin with a number",
  //   username: username === "toto" ? "Text2 mustn’t begin with a number" : ""
  // });
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
  } else {
    return (
      <div>
        <Formol
          onSubmit={input => {
            console.log(input);
            if (!input.username || !input.password) {
              setErrors({ message: "Missing field." });
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
                  setErrors({
                    message: res.graphQLErrors.map(error => error.message),
                    username: input.username
                  });
                });
            }
          }}
        >
          <Field required>Username</Field>
          <Field
            required
            type="password"
            minLength={8}
            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*#?&']{8,}$"
            validityErrors={({ patternMismatch, tooShort }) => {
              if (tooShort) {
                return "Password cannot be that short, it must contain minimum eight characters, at least one uppercase letter, one lowercase letter and one number";
              }
              if (patternMismatch) {
                return "Password must contain minimum eight characters, at least one uppercase letter, one lowercase letter and one number.";
              }
            }}
          >
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
}
