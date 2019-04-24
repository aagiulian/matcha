CREATE TYPE SEXUAL_ORIENTATION AS ENUM (
  'heterosexual', 
  'homosexual', 
  'bisexual');
 
CREATE TYPE LIKEENUM AS ENUM (
  'A->B', 
  'B->A', 
  'matched');
  
CREATE TYPE GENDER AS ENUM (
  'male', 
  'female',
  'FtM',
  'MtF');

CREATE TYPE CONNECTION_TYPE AS ENUM (
  'connected', 
  'disconnected');

CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       username VARCHAR(42) UNIQUE,
       hashed_password VARCHAR(60),
       first_name VARCHAR(42),
       last_name VARCHAR(42),
       dob TIMESTAMP,
       gender GENDER,
       sexual_orientation SEXUAL_ORIENTATION,
       bio VARCHAR(420),
       num_pics SMALLINT,
       url_pp VARCHAR(420),
       email VARCHAR(420) UNIQUE,
       last_seen TIMESTAMP,
       position POINT,
       popularity_score SMALLINT,
       verified BOOLEAN);


CREATE TABLE hashtags (
       id SERIAL PRIMARY KEY,
       name VARCHAR(42) UNIQUE);

CREATE TABLE users_hashtags (
       id SERIAL PRIMARY KEY,
       user_id INTEGER,
       hashtag_id INTEGER,
       
       FOREIGN KEY(user_id) REFERENCES users(id),
       FOREIGN KEY(hashtag_id) REFERENCES hashtags(id));

CREATE TABLE pics (
       id SERIAL PRIMARY KEY,
       user_id INTEGER,
       url VARCHAR(420),
       is_main BOOLEAN,
       FOREIGN KEY(user_id) REFERENCES users(id));

CREATE TABLE likes (
       id SERIAL PRIMARY KEY,
       user_a INTEGER,
       user_b INTEGER,
       status LIKEENUM,
       FOREIGN KEY(user_a) REFERENCES users(id),
       FOREIGN KEY(user_b) REFERENCES users(id));

CREATE TABLE blocked (
       id SERIAL PRIMARY KEY,
       user_id INTEGER,
       user_blocked INTEGER,
       FOREIGN KEY(user_id) REFERENCES users(id),
       FOREIGN KEY(user_blocked) REFERENCES users(id));


CREATE TABLE visited (
       id SERIAL PRIMARY KEY,
       datetime TIMESTAMP,
       user_id INTEGER,
       user_visited INTEGER,
       FOREIGN KEY(user_id) REFERENCES users(id),
       FOREIGN KEY(user_visited) REFERENCES users(id));

CREATE TABLE conversations (
        id SERIAL PRIMARY KEY,
        user_a INTEGER,
        user_b INTEGER,
        FOREIGN KEY(user_a) REFERENCES users(id),
        FOREIGN KEY(user_b) REFERENCES users(id));

CREATE TABLE messages (
       id SERIAL PRIMARY KEY,
       conversation_id INTEGER,
       text VARCHAR(420),
       is_read BOOLEAN,
       datetime TIMESTAMP,
       FOREIGN KEY(conversation_id) REFERENCES conversations(id));
       
CREATE TABLE connections (
       id SERIAL PRIMARY KEY,
       datetime TIMESTAMP,
       event_type CONNECTION_TYPE,
       user_id INTEGER,
       FOREIGN KEY(user_id) REFERENCES users(id));