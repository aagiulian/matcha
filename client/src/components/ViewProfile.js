import React, { useState } from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo-hooks";
import { useQuery } from "react-apollo-hooks";
import Formol, { Field } from "formol/lib/formol";
import "formol/lib/default.css";

const VIEW = gql`
mutation View($userId: Int!)
view(userId: $userId) {
    # hashtags
    # isOnline
    # popularityScore
    # lastSeen
    profile {
        username
        firstname
        lastname
        gender
        dateOfBirth
        bio
        # urlPp
        # pictures
        sexualOrientation
    }
}
`;

export default function ViewProfile({ userId }) {
  const visit = useMutation(VISIT);
  let userProfile;
  visit({
    variables: { userId }
  }).then(res => {
    userProfile = res.data.visit;
  });

  return (
    <div>
      <h1>{userProfile.profile.username}</h1>
      <h1>{userProfile.profile.firstname}</h1>
      <h1>{userProfile.profile.lastname}</h1>
      <h1>{userProfile.profile.gender}</h1>
      <h1>{userProfile.profile.sexualOrientation}</h1>
      <h1>{userProfile.profile.dateOfBirth}</h1>
      <h1>{userProfile.profile.bio}</h1>
    </div>
  );
}
