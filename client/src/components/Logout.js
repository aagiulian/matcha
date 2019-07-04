import React from "react";
import { Redirect } from "react-router-dom";

export default function Logout() {
  return (
    <div>
      <form
        onSubmit={e => {
          //   e.preventDefault();
          sessionStorage.removeItem("token");
          return <Redirect to="/login" />;
        }}
      >
        <button type="submit">Logout</button>
      </form>
    </div>
  );
}
