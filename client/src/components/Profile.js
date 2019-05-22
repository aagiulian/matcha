import React, { useState } from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo-hooks";
import { useQuery } from "react-apollo-hooks";
import Formol, { Field } from "formol/lib/formol";
import UserLocationMap from "./UserLocationMap";
import "formol/lib/default.css";

const UPDATEME = gql`
  mutation UpdateMe($input: UpdateMeInput!) {
    updateMe(input: $input) {
      profile {
	username
	firstname
	lastname
	email
	gender
	sexualOrientation
	bio
	hashtags
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
      profile {
	username
	firstname
	lastname
	email
	gender
	sexualOrientation
	bio
	dateOfBirth
	hashtags
	location {
	  lng
	  lat
	}
      }
    }
  }
`;

const HASHTAGS = gql`
  query Hashtags {
    hashtags
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
  const { data: dat, error: err, loading: load } = useQuery(HASHTAGS);
  const [location, setLocation] = useState(null);
  console.log("api key:",  process.env.REACT_APP_GOOGLE_MAPS_API_KEY);

  let me;
  let tags;
  if (loading || load) {
    return <div>Loading</div>;
  } else if (!error && !err) {
    me = data.me.profile;
    if (me.__typename) {
      delete me.__typename;
    }
    tags = dat.hashtags
      .map(t => {
	return { ["#" + t]: t };
      })
      .reduce((acc, cur) => Object.assign(acc, cur), {});
    console.log("me:", me);
  } else {
    console.log("error:", error);
    console.log("err:", err);
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
      .then(result => {
	console.log("signup then:", result);
	window.location.reload();
	return;
      })
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
	onSubmit={onSubmit}
	allowUnmodifiedSubmit
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
	<Field type="checkbox-set" choices={tags}>
	  Hashtags
	</Field>
	{/* <Field type="file">Images</Field> */}
      </Formol>
    </div>
  );
}
