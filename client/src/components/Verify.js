import React from "react";
import axios from "axios";


export default function Verify(props) {
  console.log(props);

  console.log("hello world, ", `http://${process.env.REACT_APP_HOST}:30078/verify/${emailToken}`);

  const emailToken = props.match.params.emailToken;
  if (emailToken) {
    axios.get(`http://${process.env.REACT_APP_HOST}:30078/verify/${emailToken}`);
  }
  return <div>Hello boy confirm</div>;
}
