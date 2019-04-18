const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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

function sendMailToken(transporter, username, email) {
  jwt.sign(
    {
      username: username
    },
    process.env.JWT_PRIVATE,
    {
      expiresIn: 60 * 60 * 24, // expires in 24 hours
      algorithm: "RS256"
    },
    (err, emailToken) => {
      const url = `http://localhost:3000/verify/${emailToken}`;
      transporter.sendMail({
        to: email,
        subject: "Confirm Email",
        html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`
      });
    }
  );
}

async function isVerified(username) {
  // doesn't check if user actually exists
  const text = "SELECT verified FROM users WHERE username = $1";
  const values = [username];
  const { rows: results, rowCount: resultsCount } = await pool.query(
    text,
    values
  );
  if (resultsCount && results[0].verified === true) {
    return true;
  } else {
    return false;
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
      const text = "SELECT username, email FROM users";
      const res = await pool.query(text);
      if (res.rowCount) {
        console.log(res.rows);
        return res.rows;
      } else {
        return null;
      }
    }
  },
  Mutation: {
    signup: async (
      _,
      { input: { email, password, username } },
      { transporter }
    ) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const text =
        "INSERT INTO users(email, hashed_password, username, verified) VALUES($1, $2, $3, $4)";
      const values = [email, hashedPassword, username, false];
      pool.query(text, values);
      sendMailToken(transporter, username, email);
      return { email: email };
    },
    login: async (_, { input: { username, password } }) => {
      isVerified(username);
      const text =
        "SELECT id, hashed_password, username, verified FROM users WHERE username = $1";
      const values = [username];
      const { rows: results, rowCount: resultsCount } = await pool.query(
        text,
        values
      );
      console.log(results);
      if (
        resultsCount &&
        (await bcrypt.compare(password, results[0].hashed_password))
      ) {
        /////// ICI CHECK SI VERIFIED A TRUE SINON ENVOYER VERIFIED GRAPHQL ERROR
        const token = generateToken(results[0]);
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
