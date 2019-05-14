import React, { useState } from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo-hooks";
import { useQuery } from "react-apollo-hooks";
import Formol, { Field } from "formol/lib/formol";
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
        hashtags
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
        hashtags
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
  console.log(dat);
  let profile;
  let tags;
  if (loading || load) {
    return <div>Loading</div>;
  } else if (!error && !err) {
    profile = data.me.profileInfo;
    console.log(dat);
    tags = dat.hashtags
      .map(t => {
        return { ["#" + t]: t };
      })
      .reduce((acc, cur) => Object.assign(acc, cur), {});
  }
  console.log(profile);
  return (
    <Formol
      item={profile}
      onSubmit={async input => {
        console.log("Input UpdateMe", input);
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
      }}
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
  );
}
