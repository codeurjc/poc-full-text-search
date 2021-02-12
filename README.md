# poc-full-text-search

This is a proof-of-concept application to illustrate the usage of Full Text Search in a PostgreSQL environment. The stack of this POC consists of:

1. A **NodeJS** server offering a REST API to manage objects in the database, following a traditional CRUD strategy.
2. A **PostgreSQL** database with 2 types of tables: simple data tables storing the actual data, and a search table with the metadata that full text search requires.
3. A **Postman** collection to consume the server's REST API (`postman_collection.json`).

---

## Running the PoC

### 0. Requirements

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node](https://nodejs.org/es/download/)
- [Postman](https://www.postman.com/downloads/)

### 1. Start PostgreSQL

```
docker-compose up
```

> This PostgreSQL Docker setup includes **adminer** tool. To review or manage the database in the web dashboard, connect to `http://localhost:8080/` and login with (env variables being the ones defined in the `docker-compose.yml` file):
> - System: "PostgreSQL"
> - Server: "db"
> - Username: ${POSTGRES_USER} 
> - Password: ${POSTGRES_PASSWORD}
> - Database: ${POSTGRES_DB}

### 2. Run Node server

```
node server.js
```

> When starting the server the DB will be completely cleaned-up and sample data will be automatically inserted in the tables (see files inside folder `sample-data`).

### 3. Consume Postman collection REST API methods:

#### Event API
- Create a new Event
- Get multiple Events
- Get one Event
- Update Event
- Patch Event
- Delete Event
- Delete all Events

#### Search API
- List all Searches
- Search by words