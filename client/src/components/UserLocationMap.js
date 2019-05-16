import React, { useState } from "react";
import { useQuery } from "react-apollo-hooks";
//import gql from "graphql-tag";

import { withGoogleMap, withScriptjs, GoogleMap, Marker } from "react-google-maps"

const UserLocationMap = withScriptjs(withGoogleMap((props) => {
  //console.log("props:", props);
  //const [lng,lat] = props.profile.location.replace('(', '').replace(')', '').split(',');
  
  return (
  <GoogleMap
    defaultZoom={8}
    defaultCenter={props.profile.location}
  >
    <Marker position={props.profile.location}/>
  </GoogleMap>
  );
}))


export default UserLocationMap;
