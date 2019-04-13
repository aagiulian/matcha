const bcrypt = require("bcrypt");
const { generateToken } = require("../auth-helpers/generateToken");
const { pool } = require("../database");

async function getProfileInfo(id) {
  let text = "SELECT username, email FROM users WHERE id = $1";
  let values = [id];
  console.log("ID", id);
  let res = await pool.query(text, values);
  if (res.rowCount) {
    return res.rows[0];
  } else {
    return null; // ici il faudra throw une error graphql
  }
}

const resolvers = {
  User: {
    profileInfo: async ({ id }) => ({ id })
  },
  ProfileInfo: {
    username: async ({ id }) => {
      const { username } = await getProfileInfo(id);
      return username;
    },
    email: async ({ id }) => {
      const { email } = await getProfileInfo(id);
      return email;
    }
  },
  Query: {
    user: (_, { id }) => ({ id }),
    me(_, args) {
      return database.users[0];
      const users = database.users.filter(user => user.id == args.userID);

      if (users.length) return users[0];
    },
    async allUsers() {
      let text = "SELECT username, email FROM users";
      let res = await pool.query(text);
      if (res.rowCount) {
        console.log(res.rows);
        return res.rows;
      } else {
        return null;
      }
    }
  },
  Mutation: {
    signup: async (_, { input }) => {
      let hashedPassword = await bcrypt.hash(input.password, 10);
      let text =
        "INSERT INTO users(email, hashed_password, username) VALUES($1, $2, $3)";
      let values = [input.email, hashedPassword, input.username];
      pool.query(text, values);
      return { email: input.email };
    },
    login: async (_, { input }) => {
      let text =
        "SELECT id, hashed_password, username FROM users WHERE username = $1";
      let values = [input.username];
      let res = await pool.query(text, values);
      console.log("res: ");
      console.log(res);
      // let users = database.users.filter(
      //   user => user.username === input.username
      // );
      console.log("");
      if (
        res.rowCount &&
        (await bcrypt.compare(input.password, res.rows[0].hashed_password))
      ) {
        // let user = users[0];
        let token = generateToken(res.rows[0]);
        return { success: true, token: token };
      } else {
        return { success: false, token: null };
      }
    }
  }
};

module.exports = {
  resolvers
};
