import React from "react";
import gql from "graphql-tag";
import { useQuery } from "react-apollo-hooks";

const RESETPASSWORD = gql`
  query resetPasswordRequest($email: String!) {
    resetPasswordRequest(email: $email)
  }
`;

export default function ResetPassword(props) {
  let password, passwordConfirm;
  const token = props.match.params.token;
  const ResetPassword = useQuery(RESETPASSWORD);
  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (password.value === passwordConfirm.value) {
            ResetPassword({
              variables: {
                password: password.value,
                token: token
              }
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
