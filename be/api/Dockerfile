FROM php:8.2-fpm


WORKDIR /var/www/html

COPY ./src .
RUN docker-php-ext-install pdo pdo_mysql mysqli
RUN pecl install redis && docker-php-ext-enable redis