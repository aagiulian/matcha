FROM postgres:11.3-alpine
COPY fake_profiles.csv /docker-entrypoint-initdb.d/
COPY fake_hashtags.csv /docker-entrypoint-initdb.d/
COPY fake_users_hashtags.csv /docker-entrypoint-initdb.d/
RUN chmod a+r /docker-entrypoint-initdb.d/*
ADD tables.sql /docker-entrypoint-initdb.d/.