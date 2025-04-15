FROM php:8.2-cli

# Install PDO and MySQL extensions
RUN docker-php-ext-install pdo pdo_mysql

# Copy the PHP scripts into the container
#COPY php/connect.php /php/connect.php
#COPY php/Placard.php /php/Placard.php

#Copy the schema.sql file into the container
COPY schema/schema.sql /schema/schema.sql

# Set the working directory
WORKDIR /php

# Command to run the PHP script
CMD ["php", "connect.php"]