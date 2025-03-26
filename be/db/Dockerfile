FROM php:8.2-cli

# Install PDO and MySQL extensions
RUN docker-php-ext-install pdo pdo_mysql

# Copy the PHP scripts into the container
COPY connect.php /var/www/html/connect.php
COPY Placard.php /var/www/html/Placard.php

# Set the working directory
WORKDIR /var/www/html

# Command to run the PHP script
CMD ["php", "connect.php"]
