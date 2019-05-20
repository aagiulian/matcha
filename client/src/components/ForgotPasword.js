import React from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo-hooks";

const SENDFORGOTPASSWORDEMAIL = gql`
  mutation sendForgotPasswordEmail($email: String!) {
    sendForgotPasswordEmail(email: $email)
  }
`;

const ForgotPassword = props => {
  let email;
  const sendForgotPasswordEmail = useMutation(SENDFORGOTPASSWORDEMAIL);
  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          sendForgotPasswordEmail({
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

export default ForgotPassword;
