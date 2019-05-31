#!/bin/bash

cd scripts && ./start-postgres.sh && cd ..
cd scripts && ./start-react-app.sh && cd ..
cd scripts && ./start-adminer.sh && cd ..
cd scripts && ./start-graphql-api.sh && cd ..
