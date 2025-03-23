# Scoreboard and score management system

This project is a simple web application to manage scores and scoreboards. (Add a better description)

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

To start developing, you must build a dev server. 

```bash
docker compose build 
```
If you have already built the images/containers, before you can simply run:
```bash
docker compose up 
```


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