FROM mariadb:latest

COPY ./schema/schema.sql /schema.sql

EXPOSE 3306

CMD service mariadb start && \
    echo "Running schema.sql..." && \
    mariadb -u root --password="$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" < /schema.sql && \
    tail -f /dev/null
