import React from "react";
import { Link } from "react-router-dom";
import { withRouter } from "react-router";

function Header() {
  const isLogged = sessionStorage.getItem('token');
  return (
    <div className="flex pa1 justify-between nowrap orange">
      <div className="flex flex-fixed black">
        <div className="fw7 mr1">Header</div>
        <Link to="/" className="ml1 no-underline black">
          Home
        </Link>
        |
        <Link to="/signup" className="ml1 no-underline black">
          Signup
        </Link>
        |
        <Link to="/login" className="ml1 no-underline black">
          Login
        </Link>
      </div>
    </div>
  );
}

export default withRouter(Header);
