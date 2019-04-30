import React from "react";

/*
import gql from "graphql-tag";
import { useMutation } from "react-apollo-hooks";

const LOGOUT = gql`
  mutation Logout($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      success
      token
    }
  }
`;
*/

export default function Logout() {
  return (
    <div>
      <form
        onSubmit={e => {
          //   e.preventDefault();
          sessionStorage.removeItem("token");
        }}
      >
        <button type="submit">Logout</button>
      </form>
    </div>
  );
}
