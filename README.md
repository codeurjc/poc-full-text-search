# poc-full-text-search

This is a proof-of-concept application to illustrate the usage of Full Text Search in a PostgreSQL environment. The stack of this PoC consists of:

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

### 3. Consume Postman collection REST API methods

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

---

## Understanding the PoC

The searching feature implemented by this application is based on PostgreSQL native Full-Text-Search capabilities. It can be summarize in the following points:

- When a new row is inserted in a data table, automatically a new row is inserted into the search table thanks to a PostgreSQL trigger. Both rows share the very sam primary key ("id" field).
- Data rows contain a title and a description, and the search row contains a TSVECTOR built by combining both the title and the description, applying a higher weight to the title.
- Whenever a row of the data table is modified (all or some of its fields), the associated row of the search table is also accordingly modified. The TSVECTOR field is re-generated to support changes in the title or description.
- Whenever a row of the data table is deleted, the associated row of the search table is also deleted.
- The search operation has 2 important properties:
    1. The list of words provided as search query are joined with an OR operator. Any data row containing any of the provided words will be returned.
    2. The search results are returned in descent order according to their similarity with the given words (of course taking into account the different weights of the data columns). PostgreSQL function `ts_rank_cd` is used for this purpose: it ranks documents for query using the Cover Density Ranking algorithm. This algorithm is similar to the default one of function `ts_rank`, but the proximity of matching lexemes to each other is also taken into consideration, which translates in a higher level of interest in phrases than in the actual terms of the search query itself.