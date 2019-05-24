import { User } from "../../../models/User";
import Like from "../../../models/Like";
import Block from "../../../models/Block";
import Visit from "../../../models/Visit";

export const resolvers = {
  User: {
    profile: ({ id }) => ({ id }),
    conversations: ({ id }) => ({ id }),
    likes: async ({ id }) => Like.list(id),
    matchs: async ({ id }) => Like.matchList(id),
    visits: async ({ id }) => Visit.list(id),
    blocked: async ({ id }) => Block.list(id)
  },
  Profile: {
    username: async ({ id }, _, { profileLoader }) => {
      const { username } = await profileLoader.load(id);
      return username;
    },
    firstname: async ({ id }, _, { profileLoader }) => {
      const { firstname } = await profileLoader.load(id);
      return firstname;
    },
    lastname: async ({ id }, _, { profileLoader }) => {
      const { lastname } = await profileLoader.load(id);
      return lastname;
    },
    gender: async ({ id }, _, { profileLoader }) => {
      const { gender } = await profileLoader.load(id);
      return gender;
    },
    dateOfBirth: async ({ id }, _, { profileLoader }) => {
      const { dateOfBirth } = await profileLoader.load(id);
      return dateOfBirth;
    },
    bio: async ({ id }, _, { profileLoader }) => {
      const { bio } = await profileLoader.load(id);
      return bio;
    },
    sexualOrientation: async ({ id }, _, { profileLoader }) => {
      const { sexualOrientation } = await profileLoader.load(id);
      return sexualOrientation;
    },
    email: async ({ id }, _, { profileLoader }) => {
      const { email } = await profileLoader.load(id);
      return email;
    },
    hashtags: async ({ id }) => {
      const { hashtags } = await User.getHashtags(id);
      return hashtags;
    },
    location: async ({ id }, _, { profileLoader }) => {
      const { location } = await profileLoader.load(id);
      return location;
    }
  },
  Query: {
    user: (_, { id }) => ({ id })
  }
};
