#!/bin/bash

service mariadb start

echo "Running schema.sql..."
mariadb -u root -p"$DB_ROOTPASSWORD" "$DB_NAME" < /schema.sql

# Wait to keep the container alive
wait
