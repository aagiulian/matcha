import React from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo-hooks";

const RESETPASSWORD = gql`
  mutation resetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input)
  }
`;

export default function ResetPassword(props) {
  let password, passwordConfirm;
  const token = props.match.params.token;
  const ResetPassword = useMutation(RESETPASSWORD);
  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (password.value === passwordConfirm.value) {
            ResetPassword({
              variables: {
                input: {
                  password: password.value,
                  token: token
                }
              }
            })
              .then(res => {
                console.log("password changed");
              })
              .catch(e => {
                console.log("password not changed probably bad token");
                console.log(e);
              });
            password.value = "";
            passwordConfirm.value = "";
          } else {
            console.log("password don't match");
            // set errors
          }
        }}
      >
        <input
          ref={node => {
            password = node;
          }}
          type="password"
          placeholder="password"
          name="password"
        />
        <br />
        <input
          ref={node => {
            passwordConfirm = node;
          }}
          type="password"
          placeholder="Confirm password"
          name="passwordConfirm"
        />
        <br />
        <button type="submit">Reset password</button>
      </form>
    </div>
  );
}
