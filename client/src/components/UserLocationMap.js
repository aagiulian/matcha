import React, { useState } from "react";
import { useQuery } from "react-apollo-hooks";
//import gql from "graphql-tag";

import { withGoogleMap, withScriptjs, GoogleMap, Marker } from "react-google-maps"

const UserLocationMap = withScriptjs(withGoogleMap((props) => {
  const markerRef = React.createRef();
  console.log("props:", props);
  //const [lng,lat] = props.profile.location.replace('(', '').replace(')', '').split(',');

  const onPositionChanged = () => {
    const position = markerRef.current.getPosition();
    const location = {lng: position.lng(),
                      lat: position.lat()};
    //console.log("Position changed:", location);
    props.setProfileLocation(location);
  }
  
  return (
  <GoogleMap
    defaultZoom={12}
    defaultCenter={props.profileLocation}
  >
    <Marker
      ref={markerRef}
      position={props.profileLocation}
      defaultDraggable={true}
      onPositionChanged={onPositionChanged}
    />
  </GoogleMap>
  );
}))


export default UserLocationMap;
