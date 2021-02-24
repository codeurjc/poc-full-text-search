# poc-full-text-search

This is a proof-of-concept application to illustrate the usage of Full Text Search in a PostgreSQL environment. The stack of this PoC consists of:

1. A **NodeJS** server offering a REST API to manage objects in the database, following a traditional CRUD strategy.
2. A **PostgreSQL** database with 1 simple data table. Plugin [PGroonga](https://pgroonga.github.io/) is used to support languages that are not originally from western Europe.
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

> The docker-compose.yml file declares 2 services:
> - `db`: the PostgreSQL database with the PGroonga plugin already installed.
> - `dbsetup`: the very same container as the previous one, but here used to wait until Postgre is ready to enable the PGroonga plugin. The container is stopped after that.
>
> The PostgreSQL database runs in a static IP (`172.99.0.22`) of network `static-network`.

### 2. Run Node server

```
node server.js
```

> When starting the server the DB will be completely cleaned-up and sample data will be automatically inserted in the table (see files inside folder `sample-data`).

### 3. Consume Postman collection REST API methods

#### Event API
- Create a new Event
- Create a new Event (Chinese)
- Get multiple Events
- Get one Event
- Update Event
- Patch Event
- Delete Event
- Delete all Events

#### Search API
- Search by words
- Search by words (Chinese)
- Search by words (Arabic)

The "Search by words" operation consists of:

`GET http://localhost:5000/api/searches/search?table=events&lang=en&words=WORD1,WORD2`

The following query parameters are required:
- `table`: mandatory, the table where to perform the search.
- `words`: mandatory, a comma-separated list of the words to search.
- `lang`: optional, indicating the language of the searched document. If defined, an additional filter will be added to the query to filter by field `lang`. But it doesn't actually participate in the full text search query itself. If undefined, a default query will be performed, delegating the responsibility to PGroonga library (which is prepared to manage the language itself according to the [official documentation](https://pgroonga.github.io/v1/reference/pgroonga-versus-textsearch-and-pg-trgm.html#index-creation)).

The result is an array with objects defined by the following fields:

- `id`: id of the element.
- `title`: title of the element.
- `lang`: language of the element.
- `score`: precision of the element according to the searched terms. Elements are sorted in descending order according to this parameter.
- `title_context`: array of strings with the surrounding text of the found keywords (in the title of the elements). This is also known as KWIC (KeyWord In Context). The keywords are marked as HTML elements. For example:  _surrounding text **`<span class=\"keyword\">mykeyword</span>`** surrounding text_
- `description_context`: same as *title_context* but with the description column of the elements.

A result for a search like this: **`http://localhost:5000/api/searches/search?table=events&lang=es&words=Madrid,inmigrante`**
```json
[
    {
        "id": 3,
        "title": "Servicio de Apoyo Itinerante al Alumnado Inmigrante (SAI)",
        "lang": "spanish",
        "score": 4,
        "title_context": [
            "Servicio de Apoyo Itinerante al Alumnado <span class=\"keyword\">Inmigrante</span> (SAI)"
        ],
        "description_context": [
            " Juventud y Deporte de la Comunidad de <span class=\"keyword\">Madrid</span> ofrece un servicio de apoyo y asesoramiento dirigido a facilitar la incorporación educativa del alumnado <span class=\"keyword\">inmigrante</span> que se escolariza a lo largo del curs"
        ]
    }
]
```

---

## Understanding the PoC

The searching feature implemented by this application is based on PostgreSQL plugin **PGroonga**. This plugin supports full text search in all languages.

- Search queries are performed against the index of the searched table. This index must be built for each table to be searchable, with this SQL command:

```sql
CREATE INDEX my_index ON my_table USING PGroonga ((ARRAY[column1, column2]));
```

Then the search query is as simple as this:

```sql
SELECT columnA, columnB FROM my_table WHERE ARRAY[columnX, columnY] &@~ ('term1 OR term2', ARRAY[2, 1], 'my_index')::pgroonga_full_text_search_condition
```

Being:
 - `columnX` and `columnY` the columns where to perform the search query.
 - `term1` and `term2` the terms of the search query. In this example joined by an OR operator.
 - `ARRAY[2, 1]` the weights to apply to columns `columnX` and `columnY` respectively.

Some notes:

- As indexes are automatically updated by PostgreSQL whenever the related table is modified (with additions, removals or insertions), no trigger is required to keep the search functionality updated.
- PGroonga supports advanced searching features:
    - It can return the score for each row that matched the search query, representing the precision. Higher score, better fit of the row in the search query. For example, in this PoC the searched items are returned in descent order according to their score.
    - It can manage different weights for different columns when performing a search in a table. This affects the score obtained for each result, or event the results themselves if weight is set to 0 for some column. For example, in this PoC the "title" column of the searchable entity has double the weight of its "description" column.
    - It can work with AND/OR operators for multiple-word searches, with any combination between them. For example, this PoC concatenates all searched terms with OR operators.