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

### Create a new endpoint

Create a file inside the `api/src/routes` directory, the name of the file will be the name of the endpoint. Each file must contain the following code to return a message:

```php
echo json_encode(["attribute1" => "data", "attribute2" => "data"]);
```

### Backend Structure

```
├── mariaDB :: database 
└── api :: back-end logic
    ├── nginx.conf :: server configuration
    └── src 
         ├── index.php :: Init server
         ├── router.php :: Routing logic
         └── routes :: endpoints
```

