FROM php:8.1-apache

RUN docker-php-ext-install mysqli pdo pdo_mysql
COPY config/virtualhost.conf /etc/apache2/sites-available/000-default.conf
RUN a2enmod rewrite