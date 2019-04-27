import React from "react";
import { Link } from "react-router-dom";
import Login from "./Login";
import Logout from "./Logout";
import { withRouter } from "react-router";

function Header() {
  const token = sessionStorage.getItem('token');
  const isLogged = token !== null;
  console.log("token:", token);
  console.log("isLogged:", isLogged);
  return (
    <div className="flex pa1 justify-between nowrap orange">
      <div className="flex flex-fixed black">
        <div className="fw7 mr1">Header</div>
        {isLogged ? (
          <div>
          <Link to="/" className="ml1 no-underline black">
            Home
          </Link>
          <Logout />
          </div>
        ) : (
          <Login />
        )}
      </div>
    </div>
  );
}


export default withRouter(Header);
