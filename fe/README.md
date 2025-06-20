# ZSCORE

WebApp for ZScore application. Connection with backend API and database as well as frontend logic is handled by this application.

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
### Env File Specification

Create a `.env` file in the `api` and `db` folders with the following content:

```env
VITE_API_HOSTNAME=
VITE_APP_BASE_ROUTE=
HOST_PORT=
```

### Frontend Structure

```
├── src/
│   ├── api/                   # API manager and endpoint definitions
│   │   ├── apiManager.ts      # Handles all API requests to backend
│   │   └── endPoints.ts
│   ├── components/            # Reusable UI components
│   │   ├── ...
│   │      
│   ├── pages/                 # Main page components (routing targets)
│   │   ├── ...
│   │      
│   ├── styles/                # SCSS stylesheets
│   ├── utils/                 # Utility functions and types
│   ├── config/                # App configuration
│   ├── media-queries/         # Responsive breakpoints
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets (images, icons, etc.)
├── index.html                 # Main HTML entry point
└── vite.config.ts             # Vite configuration
```

#### How Components Make Requests to the Backend

All API requests from the frontend are made using the `apiManager` class (`src/api/apiManager.ts`). This class provides methods for each backend endpoint (e.g., `getScores`, `getFouls`, `getCards`, etc.), abstracting away the HTTP request details.

- **Usage Example:**  
  In a React component, you typically call an `apiManager` method inside a `useEffect` or event handler:
  ```tsx
  useEffect(() => {
      apiManager.getScores(placardId, sport)
        .then((data) => setScores(data))
        .catch((error) => console.error(error));
  }, [placardId, sport]);
  ```
- **How it works:**  
  The `apiManager` methods return Promises and handle all request/response logic, including error handling and toast notifications. Components only need to call the relevant method and update their state with the result.

For more details, see the code in [`src/api/apiManager.ts`](src/api/apiManager.ts).
