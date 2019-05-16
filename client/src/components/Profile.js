import React, { useState } from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo-hooks";
import { useQuery } from "react-apollo-hooks";
import Formol, { Field } from "formol/lib/formol";
import UserLocationMap from "./UserLocationMap.js";
import "formol/lib/default.css";

const UPDATEME = gql`
  mutation UpdateMe($input: UpdateMeInput!) {
    updateMe(input: $input) {
      profileInfo {
        username
        firstname
        lastname
        email
        gender
        sexualOrientation
        bio
        location {
          lng
          lat
        }
      }
    }
  }
`;
const ME = gql`
  query Me {
    me {
      profileInfo {
        username
        firstname
        lastname
        email
        gender
        sexualOrientation
        bio
        dateOfBirth
        location {
          lng
          lat
        }
      }
    }
  }
`;

const Gender = {
  Male: "male",
  Female: "female"
};
const SexualOrientations = {
  Heterosexual: "heterosexual",
  Homosexual: "homosexual",
  Bisexual: "bisexual"
};

export default function Profile(props) {
  const updateMe = useMutation(UPDATEME);
  const { data, error, loading } = useQuery(ME);
  const [location, setLocation] = useState(null);
  let me;

  if (loading) {
    return <div>Loading</div>;
  } else if (!error) {
    me = data.me.profileInfo;
    if (me.__typename) {
      delete me.__typename;
    }
  }

  const setProfileLocation = ({ lng, lat }) => {
    setLocation({ lng, lat });
  }

  const onSubmit = async (formInput) => {
    const newLocation = {"location": location ? location : me.location};
    const input = Object.assign(formInput, newLocation);

    return await updateMe({
	variables: {
	input: input
	}
    })
	.then(result => console.log("signup then:", result))
	.catch(e =>
	e.graphQLErrors
	    .map(err => err.extensions.exception.invalidArgs)
	    .reduce((acc, error) => Object.assign(acc, error), {})
	);
  }

  return (
    <div>
      <UserLocationMap
        profileLocation={me.location}
        setProfileLocation={setProfileLocation}
        googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`}
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div style={{ height: `400px` }} />}
        mapElement={<div style={{ height: `100%` }} />}
      />
    <Formol
      item={me}
      allowUnmodifiedSubmit
      onSubmit={onSubmit}
    >
      <Field>Username</Field>
      <Field>Firstname</Field>
      <Field>Lastname</Field>
      <Field>Email</Field>
      {/* <Field>Password</Field> */}
      <Field type="select" choices={Gender}>
        Gender
      </Field>
      <Field type="select" choices={SexualOrientations}>
        Sexual Orientation
      </Field>
      <Field type="area">Bio</Field>
      <Field type="date">Date of Birth</Field>
      {/* <Field>Hashtag</Field> */}
      {/* <Field type="file">Images</Field> */}
    </Formol>
    </div>
  );
}
