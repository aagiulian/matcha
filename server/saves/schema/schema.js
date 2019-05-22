const { gql } = require("apollo-server");

const typeDefs = gql`
  directive @isAuthenticated on FIELD_DEFINITION
  directive @isOwner on FIELD_DEFINITION

  scalar Date
  scalar Upload

  enum SexualOrientation {
    heterosexual
    homosexual
    bisexual
  }
  enum Gender {
    male
    female
    ftm
    mtf
  }
  enum ConnectionType {
    connected
    disconnected
  }

  type Node {
    id: Int!
    createdAt: Date!
    updatedAt: Date!
  }

  type User {
    id: Int!
    profile: Profile
    position: String!
    isOnline: Boolean!
    popularityScore: String!
    lastSeen: String!
    verified: Boolean!
    protected: ProtectedInfo!
  }

  type ProtectedInfo {
    hashedPassword: String! @isAuthenticated
  }

  type Profile {
    username: String!
    firstname: String!
    lastname: String!
    gender: Gender
    dateOfBirth: String
    bio: String
    numPics: Int
    urlPp: String
    pictures: [Picture]
    sexualOrientation: SexualOrientation
    email: String!
    hashtags: [String]
  }

  type Relation {
    visitedBy: [User]
    likes: [User]
    matches: [User]
    blocks: [User]
    conversation: [Conversation]
  }

  type Hashtag {
    id: Int!
    name: String!
    users: [User]
  }

  type Picture {
    id: Int!
    # user: User!
    url: String!
    # ismain: Boolean!
  }

  type Conversation {
    id: Int!
    messages: [Message]
    # userA: User
    # userB: User
  }

  type Message {
    id: Int!
    text: String!
    isRead: Boolean!
    datetime: String!
    emitter: User!
    conversationId: Conversation!
  }

  type SignupResponse {
    #id: Int!
    email: String!
  }

  type AuthPayload {
    success: Boolean!
    token: String
  }

  input SignupInput {
    email: String!
    username: String!
    firstname: String!
    lastname: String!
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
    # password: String
    gender: Gender
    bio: String
    dateOfBirth: Date
    sexualOrientation: SexualOrientation
    hashtags: [String]
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
    view(userId: Int!): User
    uploadFile(file: Upload!): Boolean!
    createMessage(message: String): Boolean!
  }

  type Query {
    me: User
    """
    @isOwner
    """
    user(id: Int!): User
    allUsers: [User]
    suggestions: [User]
    hashtags: [String]
    node(
      """
      The Int of the object
      """
      id: Int!
    ): Node
  }

  type Subscription {
    userLogged: String
  }
`;

module.exports = {
  typeDefs
};
