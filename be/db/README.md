# PHP and MariaDB Dockerized Application

This project demonstrates how to connect a PHP application to a MariaDB database using Docker or directly on your local machine.

## Prerequisites

- Docker installed on your system <!-- (if using Docker) -->
- Docker Compose installed on your system <!-- (if using Docker) -->
<!-- - PHP installed on your system (if running without Docker)
- MariaDB installed on your system (if running without Docker) -->
- A MariaDB client installed on your system (e.g., `mariadb` CLI or a GUI tool like MySQL Workbench)

## Setup Instructions

1. Clone this repository or copy the files into a directory.
2. Navigate to the project directory in your terminal.

## Running the Application with Docker

1. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

2. The PHP script will automatically run and attempt to connect to the MariaDB database.

3. Check the logs of the `php-app` container to see the output:
   ```bash
   docker logs php-app
   ```

4. To stop the containers, press `Ctrl+C` or run:
   ```bash
   docker-compose down
   ```
<!-- 
## Running the Application without Docker

1. **Install MariaDB**:
   - Install MariaDB on your system. For example, on Ubuntu:
     ```bash
     sudo apt update
     sudo apt install mariadb-server
     ```
       or
    ```bash
     sudo apt install mariadb-server-10.1
     ```
   - Start the MariaDB service:
     ```bash
     sudo service mariadb start
     ```

2. **Set Up the Database**:
   - Log in to MariaDB:
     ```bash
     mariadb -u root -p
     ```
   - When prompted for the password, just click enter (the default password is empty).
   - Create the `zscoredb` database:
     ```sql
     CREATE DATABASE zscoredb;
     ```
   - Exit MariaDB:
     ```sql
     EXIT;
     ```

3. **Install PHP**:
   - Install PHP and required extensions. For example, on Ubuntu:
     ```bash
     sudo apt update
     sudo apt install php php-mysql
     ```

4. **Update the PHP Script**:
   - Open the `connect.php` file and update the `$pass` variable to match the MariaDB root password, empty string:
     ```php
     $pass = '';
     ```

5. **Run the PHP Script**:
   - Execute the `connect.php` script:
     ```bash
     php connect.php
     ``` -->

## Connecting Directly to MariaDB via TCP Port

You can connect to the MariaDB database using a MariaDB client via the exposed TCP port.

1. Use the following command to connect using the `mariadb` CLI tool:
   ```bash
   mariadb -h 127.0.0.1 -P 3306 -u root -p
   ```

2. When prompted, enter the root password (`password`).

3. Once connected, you can run SQL commands. For example:
   ```sql
   SHOW DATABASES;
   USE zscoredb;
   SHOW TABLES;
   ```

4. To exit the MariaDB CLI, type:
   ```sql
   EXIT;
   ```

## Connecting to MariaDB via Docker

If you run MariaDB with docker, you can connect directly to the MariaDB database using `docker exec`.

1. Open a terminal and run the following command to access the MariaDB container:
   ```bash
   docker exec -it mariadb mariadb -u root -p
   ```

2. When prompted, enter the root password (`new_password` by default).

3. Once connected, you can run SQL commands. For example:
   ```sql
   SHOW DATABASES;
   USE zscoredb;
   SHOW TABLES;
   ```

4. To exit the MariaDB CLI, type:
   ```sql
   EXIT;
   ```

## Notes

- The MariaDB database is configured with the following credentials:
  - **Root Password**: `password`
  - **Database Name**: `zscoredb`
- You can modify these settings in the `connect.php` file if running without Docker or in the `docker-compose.yml` file if using Docker.
