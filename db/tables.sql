CREATE TYPE SEXUAL_ORIENTATION AS ENUM
(
  'heterosexual', 
  'homosexual', 
  'bisexual');

CREATE TYPE LIKEENUM AS ENUM
(
  'A->B', 
  'B->A', 
  'matched');

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
  user_id INTEGER,
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
  id SERIAL PRIMARY KEY,
  user_a INTEGER,
  user_b INTEGER,
  status LIKEENUM,
  FOREIGN KEY(user_a) REFERENCES users(id),
  FOREIGN KEY(user_b) REFERENCES users(id)
);

CREATE TABLE blocked
(
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  user_blocked INTEGER,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(user_blocked) REFERENCES users(id)
);


CREATE TABLE visited
(
  id SERIAL PRIMARY KEY,
  datetime TIMESTAMPTZ,
  user_id INTEGER,
  user_visited INTEGER,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(user_visited) REFERENCES users(id)
);

CREATE TABLE conversations
(
  id SERIAL PRIMARY KEY,
  user_a INTEGER,
  user_b INTEGER,
  FOREIGN KEY(user_a) REFERENCES users(id),
  FOREIGN KEY(user_b) REFERENCES users(id)
);

CREATE TABLE messages
(
  id SERIAL PRIMARY KEY,
  text TEXT,
  emitter INTEGER,
  recipient INTEGER,
  conversation_id INTEGER,
  created_at TIMESTAMPTZ,
  is_read BOOLEAN,
  FOREIGN KEY(conversation_id) REFERENCES conversations(id),
  FOREIGN KEY(emitter) REFERENCES users(id),
  FOREIGN KEY(recipient) REFERENCES users(id)
);

CREATE TABLE connections
(
  id SERIAL PRIMARY KEY,
  datetime TIMESTAMPTZ,
  event_type CONNECTION_TYPE,
  user_id INTEGER,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE notifications
(
  id SERIAL PRIMARY KEY,
  datetime TIMESTAMPTZ,
  notification_type NOTIFICATION_TYPE,
  send_id INTEGER,
  recv_id INTEGER,
  FOREIGN KEY(send_id) REFERENCES users(id),
  FOREIGN KEY(recv_id) REFERENCES users(id)
);


\COPY users (bio,email,firstname,gender,hashed_password,lastname,location,lookingfor,num_pics,popularity_score,sexual_orientation,url_pp,username,verified,date_of_birth,last_seen) FROM '/docker-entrypoint-initdb.d/fake_profiles.csv' DELIMITER ';' CSV HEADER;
