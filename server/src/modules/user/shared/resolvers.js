import { pool } from "../../postgres";

export const resolvers = {
  User: {
    profileInfo: async ({ id }) => ({ id })
  },
  ProfileInfo: {
    username: async ({ id }) => {
      const { username } = await getProfileInfo(id);
      return username;
    },
    firstname: async ({ id }) => {
      const { firstname } = await getProfileInfo(id);
      return firstname;
    },
    lastname: async ({ id }) => {
      const { lastname } = await getProfileInfo(id);
      return lastname;
    },
    gender: async ({ id }) => {
      const { gender } = await getProfileInfo(id);
      return gender;
    },
    dateOfBirth: async ({ id }) => {
      const { dateOfBirth } = await getProfileInfo(id);
      return dateOfBirth;
    },
    bio: async ({ id }) => {
      const { bio } = await getProfileInfo(id);
      return bio;
    },
    sexualOrientation: async ({ id }) => {
      const { sexualOrientation } = await getProfileInfo(id);
      return sexualOrientation;
    },
    email: async ({ id }) => {
      const { email } = await getProfileInfo(id);
      return email;
    },
    hashtags: async ({ id }) => {
      const { hashtags } = await getUserHashtags(id);
      return hashtags;
    }
  },
  Query: {
    user: (_, { id }) => ({ id })
  }
};

async function getProfileInfo(id) {
  let text = `
    SELECT 
      users.id, 
      users.username, 
      users.hashed_password as "hashedPassword", 
      users.firstname, 
      users.lastname, 
      users.date_of_birth as "dateOfBirth", 
      users.gender, 
      users.sexual_orientation as "sexualOrientation", 
      users.bio, 
      users.num_pics as "numPics", 
      users.url_pp as "urlPp", 
      users.email, 
      users.last_seen as "lastSeen", 
      users.position, 
      users.popularity_score, 
      users.verified,
      pics.url
    FROM 
      users 
    LEFT JOIN 
      pics 
    ON 
      pics.user_id = users.id 
    WHERE 
      users.id = $1`;
  let values = [id];
  let res = await pool.query(text, values);
  if (res.rowCount) {
    if (res.rows[0].dateOfBirth !== null) {
      res.rows[0].dateOfBirth = moment(res.rows[0].dateOfBirth).format(
        "YYYY-MM-DD"
      );
    }
    return res.rows[0];
  } else {
    return null;
  }
}

async function getUserHashtags(id) {
  const text = `
    SELECT 
      hashtag_name 
    FROM 
      users_hashtags 
    WHERE 
      user_id = $1`;
  const values = [id];
  let res = await pool.query(text, values);
  if (res.rowCount) {
    return { hashtags: res.rows.map(i => i.hashtag_name) };
  } else {
    return { hashtags: null };
  }
}
