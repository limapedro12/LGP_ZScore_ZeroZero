# ZSCORE

Platform for indoor scoreboards management and display. Built-in visualization and management tools for Basketball, Volleyball, and Futsal scoreboards.

You can see a Demo of the product by clicking in the image below. 
[![ZScore Demo](https://img.youtube.com/vi/wV0VnYSFYw0/0.jpg)](https://www.youtube.com/watch?v=wV0VnYSFYw0)

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
In case you have already built the server before and want to build it again, be sure to remove the prexisting volumes. You can do this by running:
```bash
docker compose down -v
```

You can then start and build the server with:

```bash
docker compose up --build
```

### Documentation

The API contains documentation, in order to check it out go to the `docs` folder inside the `api`directory and run:

```bash
npm install
npx docusaurus start
```

After that simply open http://localhost:3000 on your web browser.


### Project Structure

You can work and run each part individually.

- [Front End](fe/README.md)

- [Back End](be/README.md)


```

├── fe :: Web app.
└── be
    ├── api:: api to process info.
    └── db :: Database from the system.

```
