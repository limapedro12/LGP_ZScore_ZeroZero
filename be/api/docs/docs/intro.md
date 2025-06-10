---
sidebar_position: 1
---

# ZScore
Backend for the ZScore platform

## Installation

### Prerequisites

- [`Docker`](https://www.docker.com)
- [`Docker Compose`](https://www.docker.com)

### Installing Docker

The best approach to install `docker` is to follow the official guide [here](https://docs.docker.com/install/linux/docker-ce/ubuntu/#install-using-the-repository). 

Please follow the steps in `Install using the repository` section.

Next, follow [these](https://docs.docker.com/install/linux/linux-postinstall/) steps to configure docker access with non sudo permissions in the `Manage Docker as a non-root user` section.

### Installing Docker Compose

The best approach to install `docker-compose` is to follow the official guide [here](https://docs.docker.com/compose/install/#install-compose). 

## Usage

### Development
You can start developing by building the local server with docker:

```bash
docker compose build
```
In case you have already built the server before and want to build it again, be sure to delete the folder database/data. You can do this by running  `sudo rm -r database/data/`.
You can then start the server with:

```bash
docker compose up
```
### Env File Specification

Create a `.env` file in the `api` and `db` folders with the following content:

```env
DB_NAME
DB_USERNAME
DB_PASSWORD
DB_ROOTPASSWORD
REDIS_PORT
REDIS_HOST
APP_KEY
API_URL
```

### Documentation

The API contains documentation, in order to check it out go to the `docs` folder inside the `api`directory and run:

```bash
npm install
npx docusaurus start
```

After that simply open http://localhost:3000 on your web browser.

### Backend Structure

```
├── api/                # Backend application logic (PHP)
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── nginx.conf      # Nginx server configuration
│   ├── .env            # API environment variables
│   └── src/
│       ├── index.php   # Entry point for the API
│       ├── router.php  # Routing logic
│       ├── config/     # Configuration files
│       │   └──config.php  # Sports related configuration
│       ├── classes/ # Database classes
│       └── routes/     # API endpoint handlers
│           ├── ...     # Individual route PHP files (endpoints)
│
├── db/                 # Database service (MariaDB)
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── .env            # DB environment variables
│   └── schema/
│       └── schema.sql  # Database schema definition
│
├── docker-compose.yml  # Root compose file (includes api and db)
└── README.md           # Project documentation
```

