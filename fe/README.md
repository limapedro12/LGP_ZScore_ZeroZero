# Scoreboard and score management system

This project is a simple web application to manage scores and scoreboards. (Add a better description)

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
> If you are developing in VS Code, ESLint (the linter and formatter used in this project) might flag an error in `/src/components/RulesPage/rules.js`. If that happens you should add the following line to your `settings.json` file: `"eslint.nodeEnv": "development"`


### Env File Specification

- `HOST_PORT`= The port where you will access the dev server in your machine (`https://localhost:<HOST_PORT>`)


## Project Details

This project uses [`React`](https://react.dev/) with [`TypeScript`](https://www.typescriptlang.org/). The visual framework used is [`Bootstap`](https://react-bootstrap.netlify.app/).


### Project Structure

```

├── public :: Generated Website ends up here
└── src
    ├── services :: web app logic, interactions with API
    ├── components :: General React Components
    └── pages :: Page Components

```

