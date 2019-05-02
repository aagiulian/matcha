const { gql } = require("apollo-server");

const typeDefs = gql`
  directive @isAuthenticated on FIELD_DEFINITION
  directive @isOwner on FIELD_DEFINITION

  scalar DateTime
  enum SexualOrientation {
    HETEROSEXUAL
    HOMOSEXUAL
    BISEXUAL
  }
  enum Gender {
    MALE
    FEMALE
    FTM
    MTF
  }
  enum ConnectionType {
    CONNECTED
    DISCONNECTED
  }

  type Node {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type User {
    id: ID!
    profileInfo: ProfileInfo
    position: String!
    hashtags: [Hashtag]
    isOnline: Boolean!
    popularityScore: String!
    lastSeen: String!
    verified: Boolean!
    protected: ProtectedInfo!
  }

  type ProtectedInfo {
    hashedPassword: String! @isAuthenticated
  }

  type ProfileInfo {
    username: String!
    firstname: String!
    lastname: String!
    gender: Gender!
    dateOfBirth: String!
    bio: String!
    numPics: Int!
    urlPp: String!
    pictures: [Picture]
    sexualOrientation: SexualOrientation!
    email: String!
  }

  type Relation {
    visitedBy: [User]
    likes: [User]
    matches: [User]
    blocks: [User]
    conversation: [Conversation]
  }

  type Hashtag {
    id: ID!
    name: String!
    users: [User]
  }

  type Picture {
    id: ID!
    user: User!
    url: String!
    # ismain: Boolean!
  }

  type Conversation {
    id: ID!
    messages: [Message]
    # userA: User
    # userB: User
  }

  type Message {
    id: ID!
    text: String!
    isRead: Boolean!
    datetime: String!
    emitter: User!
    # conversation: Conversation!
  }

  type SignupResponse {
    #id: ID!
    email: String!
  }

  type AuthPayload {
    success: Boolean!
    token: String
  }

  input SignupInput {
    email: String!
    username: String!
    name: String!
    surname: String!
    password: String!
  }

  input LoginInput {
    username: String!
    password: String!
  }

  input ResetPasswordInput {
    token: String!
    password: String!
  }

  input UpdateMeInput {
    username: String!
    firstname: String!
    lastname: String!
    email: String!
    password: String
    gender: Gender
    bio: String
    # hashtag: Hashtag
    # images: Picture
  }

  type Mutation {
    signup(input: SignupInput!): SignupResponse!
    login(input: LoginInput!): AuthPayload!
    visitedBy(userId: Int!): [User]!
    resetPassword(input: ResetPasswordInput!): Boolean
    resetPasswordRequest(email: String!): Boolean
    updateMe(input: UpdateMeInput!): User
  }

  type Query {
    me: User
    """
    @isOwner
    """
    user(id: Int!): User
    allUsers: [User]
    node(
      """
      The ID of the object
      """
      id: ID!
    ): Node
  }
`;

module.exports = {
  typeDefs
};
