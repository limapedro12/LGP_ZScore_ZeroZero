FROM php:8.2-apache

RUN docker-php-ext-install pdo pdo_mysql

RUN apt-get update && apt-get install -y \
    libzip-dev zip unzip \
    && docker-php-ext-install zip

# Instalar extensão Redis do PHP
RUN pecl install redis && docker-php-ext-enable redis

# Ativa o mod_rewrite se precisar futuramente
RUN a2enmod rewrite

EXPOSE 80
