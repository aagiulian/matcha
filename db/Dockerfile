FROM postgres:latest


EXPOSE 5432:5432
ENV POSTGRES_DB docker
ENV POSTGRES_USER docker
ENV POSTGRES_PASSWORD docker
ADD tables.sql /docker-entrypoint-initdb.d/.