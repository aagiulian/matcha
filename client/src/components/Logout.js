import React from "react";
import { Redirect } from "react-router-dom"

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
          return (<Redirect to="/login"/>)

        }}
      >
        <button type="submit">Logout</button>
      </form>
    </div>
  );
}
