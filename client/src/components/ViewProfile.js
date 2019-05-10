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
    profileInfo {
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
      <h1>{userProfile.profileInfo.username}</h1>
      <h1>{userProfile.profileInfo.firstname}</h1>
      <h1>{userProfile.profileInfo.lastname}</h1>
      <h1>{userProfile.profileInfo.gender}</h1>
      <h1>{userProfile.profileInfo.sexualOrientation}</h1>
      <h1>{userProfile.profileInfo.dateOfBirth}</h1>
      <h1>{userProfile.profileInfo.bio}</h1>
    </div>
  );
}
