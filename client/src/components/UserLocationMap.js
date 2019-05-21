import React, { useState } from "react";
import { withGoogleMap, withScriptjs, GoogleMap, Marker } from "react-google-maps"

const UserLocationMap = withScriptjs(withGoogleMap((props) => {
  const markerRef = React.createRef();

  const onDragEnd = () => {
    const position = markerRef.current.getPosition();
    const location = {lng: position.lng(),
                      lat: position.lat()};
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
      onDragEnd={onDragEnd}
    />
  </GoogleMap>
  );
}))


export default UserLocationMap;
