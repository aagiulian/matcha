import React from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo-hooks";

const RESETPASSWORDREQUEST = gql`
  mutation ResetPasswordRequest($email: String!) {
    resetPasswordRequest(email: $email)
  }
`;

const ResetPasswordRequest = props => {
  let email;
  const resetPasswordRequest = useMutation(RESETPASSWORDREQUEST);
  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          resetPasswordRequest({
            variables: { email: email.value }
          });
          email.value = "";
        }}
      >
        <input
          ref={node => {
            email = node;
          }}
          type="email"
          placeholder="email"
          name="email"
        />
      </form>
      <button type="submit">Ask for Reset Password</button>
    </div>
  );
};

export default ResetPasswordRequest;
