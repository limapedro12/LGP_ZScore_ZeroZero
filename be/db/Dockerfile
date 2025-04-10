FROM mariadb:latest

COPY ./schema/schema.sql /schema.sql
COPY ./schema/init.sh /init.sh

RUN chmod +x /init.sh

EXPOSE 3306

ENTRYPOINT ["/init.sh"]