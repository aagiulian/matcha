CREATE EXTENSION cube;
CREATE EXTENSION earthdistance;

CREATE TYPE SEXUAL_ORIENTATION AS ENUM
(
  'heterosexual', 
  'homosexual', 
  'bisexual');


CREATE TYPE GENDER AS ENUM
(
  'male', 
  'female',
  'FtM',
  'MtF');

CREATE TYPE CONNECTION_TYPE AS ENUM
(
  'connected', 
  'disconnected');

CREATE TYPE NOTIFICATION_TYPE AS ENUM
(
  'liked',
  'visited',
  'messaged',
  'match',
  'unmatch');

CREATE TABLE users
(
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE,
  hashed_password TEXT,
  firstname TEXT,
  lastname TEXT,
  date_of_birth TIMESTAMPTZ,
  gender GENDER,
  sexual_orientation SEXUAL_ORIENTATION,
  bio TEXT,
  lookingfor TEXT [],
  num_pics SMALLINT,
  url_pp TEXT,
  email TEXT UNIQUE,
  last_seen TIMESTAMPTZ,
  location POINT,
  popularity_score SMALLINT,
  verified BOOLEAN
);


CREATE TABLE hashtags
(
  name TEXT UNIQUE
);

CREATE TABLE users_hashtags
(
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  hashtag_name TEXT,

  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(hashtag_name) REFERENCES hashtags(name)
);

CREATE TABLE pics
(
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  url TEXT,
  is_main BOOLEAN,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE likes
(
  user_id INTEGER NOT NULL,
  user_liked INTEGER NOT NULL,
  primary key (user_id, user_liked),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(user_liked) REFERENCES users(id)
);

CREATE TABLE matchs
(
  user_a INTEGER NOT NULL,
  user_b INTEGER NOT NULL,
  primary key (user_a, user_b),
  FOREIGN KEY(user_a) REFERENCES users(id),
  FOREIGN KEY(user_b) REFERENCES users(id)
);

CREATE TABLE blocked
(
  user_id INTEGER NOT NULL,
  user_blocked INTEGER NOT NULL,
  primary key (user_id, user_blocked),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(user_blocked) REFERENCES users(id)
);


CREATE TABLE visited
(
  user_id INTEGER NOT NULL,
  user_visited INTEGER NOT NULL,
  datetime TIMESTAMPTZ,
  primary key (user_id, user_visited),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(user_visited) REFERENCES users(id)
);

CREATE TABLE conversations
(
  id SERIAL PRIMARY KEY,
  user_a INTEGER NOT NULL,
  user_b INTEGER NOT NULL,
  constraint not_equal check (user_a <> user_b),
  FOREIGN KEY(user_a) REFERENCES users(id),
  FOREIGN KEY(user_b) REFERENCES users(id)
);

CREATE TABLE messages
(
  id SERIAL PRIMARY KEY,
  text TEXT,
  send_id INTEGER NOT NULL,
  recv_id INTEGER NOT NULL,
  conversation_id INTEGER NOT NULL,
  created_at TIMESTAMPTZ,
  is_read BOOLEAN,
  FOREIGN KEY(conversation_id) REFERENCES conversations(id),
  FOREIGN KEY(send_id) REFERENCES users(id),
  FOREIGN KEY(recv_id) REFERENCES users(id)
);

CREATE TABLE connections
(
  id SERIAL PRIMARY KEY,
  datetime TIMESTAMPTZ,
  event_type CONNECTION_TYPE,
  user_id INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE notifications
(
  id SERIAL PRIMARY KEY,
  datetime TIMESTAMPTZ,
  notification_type NOTIFICATION_TYPE,
  send_id INTEGER NOT NULL,
  recv_id INTEGER NOT NULL,
  seen BOOLEAN,
  FOREIGN KEY(send_id) REFERENCES users(id),
  FOREIGN KEY(recv_id) REFERENCES users(id)
);


\COPY users (bio,email,firstname,gender,hashed_password,lastname,location,lookingfor,num_pics,popularity_score,sexual_orientation,url_pp,username,verified,date_of_birth,last_seen) FROM '/docker-entrypoint-initdb.d/fake_profiles.csv' DELIMITER ';' CSV HEADER;

\COPY hashtags (name) FROM '/docker-entrypoint-initdb.d/fake_hashtags.csv' DELIMITER ';' CSV HEADER;

\COPY users_hashtags (hashtag_name, user_id) FROM '/docker-entrypoint-initdb.d/fake_users_hashtags.csv' DELIMITER ';' CSV HEADER;
/*
SELECT 
  id
  FROM
      users
      LIMIT 10;

SELECT 
  users.id,
  users.username, 
  users.gender, 
  users.sexual_orientation as "sexualOrientation", 
  users.url_pp as "urlPp", 
  users.location, 
  users.popularity_score,
  users.lookingfor,
  date_part('year', age(users.date_of_birth)) as "age",
  round((users.location <@> POINT(1.00288,49.28669))::numeric, 3) as "distance"
  ARRAY_AGG (hashtag_name) hashtag_name
FROM 
  users
LEFT JOIN users_hashtags ON
  users_hashtags.user_id = users.id
LEFT JOIN users as me ON
  me.id = 1
WHERE
(users.id != 1)
AND
(users.gender::text = ANY (me.lookingfor::text[]))
AND
(me.gender::text = ANY (users.lookingfor::text[]))
AND
(date_part('year', age(users.date_of_birth)) >= 18)
AND
(date_part('year', age(users.date_of_birth)) <= 44)
AND
(users.popularity_score >= 0)
AND
(users.popularity_score <= 100)
AND
(users.popularity_score BETWEEN 0 AND 100)
AND
(users_hashtags.hashtag_name::text = ANY ('{Geocaching,Papermaking, Running}'::text[]))
GROUP BY users.id
ORDER BY distance ASC
LIMIT 20;

  */
