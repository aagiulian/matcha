import React from "react";
import axios from "axios";


export default function Verify(props) {
  const emailToken = props.match.params.emailToken;
  if (emailToken) {
    axios.get(`http://${process.env.REACT_APP_EMAIL_CHECK}/verify/${emailToken}`);
  }
  return <div>Hello boy confirm</div>;
}
