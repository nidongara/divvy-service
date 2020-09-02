# Divvy Service

Divvy Service is a Node project to interact with data provided by https://www.divvybikes.com/system-data
This caches the data on start up and keeps it in memory on start up. Utilizes upto 4 cpu cores to for a cluster.  

## Prerequisites

Requires Node [v12](https://nodejs.org/download/release/latest-v12.x/) or above.

## Installation and Running Locally

Use the package manager [npm](https://www.npmjs.com/get-npm) to set up and run divvy-service.

```bash
npm install
npm run start
```

To run test cases
```bash
npm run test
```

ENV variables can be overrode by creating a new ```env``` file. Default ENV is being loaded from ```.env.defaults```. 

## Postman
Use this [link](https://www.getpostman.com/collections/48c500ff191c0b4092ba) to download the postman collection. 

## Curls

Here are some curl commands to the test the API's

```bash
curl --location --request GET 'localhost:3000/api/v1/station/1436495105198659242' \
--header 'Authorization: Basic YWRtaW46c3VwZXJzZWNyZXQ='

curl --location --request GET 'localhost:3000/api/v1/riders?station=233&station=546&station=548&date=04/01/2019' \
--header 'Authorization: Basic YWRtaW46c3VwZXJzZWNyZXQ='

curl --location --request GET 'localhost:3000/api/v1/last-trips?station=233&station=546&station=548&date=04/03/2019' \
--header 'Authorization: Basic YWRtaW46c3VwZXJzZWNyZXQ='
```

## Docker

You can create the Docker image from the DockerFile in the repo or download the tag from [Docker-Hub](https://hub.docker.com/repository/docker/nihardongara/divvy-service/tags?page=1)

```bash
docker pull nihardongara/divvy-service:0.0.1
```

## License
[MIT](https://choosealicense.com/licenses/mit/)
