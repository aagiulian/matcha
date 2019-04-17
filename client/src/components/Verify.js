import React from "react";
import axios from "axios";

export default function Verify(props) {
  console.log(props);
  const emailToken = props.match.params.emailToken;
  console.log("token : ", emailToken);
  if (emailToken) {
    axios.get(`http://192.168.99.100:30077/verify/?${emailToken}`);
  }
  return <div>Hello boy confirm</div>;
}
