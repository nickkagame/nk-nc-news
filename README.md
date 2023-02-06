# NK News API

# Link to hosted API

https://nk-news.onrender.com/api

# Project Summary

A lite News application featuring stories posted by members of our community, with topics including cats, Mitch, coding, and much more! 

# Instructions:
## Connecting locally to the databases

In order to successfully connect to the two databases locally, create .env files:
    One called '.env.development' - inside write the following: PGDATABASE=nc_news
    The second called '.env.test' - inside write the following: PGDATABASE=nc_news_test

## Cloning the database

To clone the repo copy the repo URL from github and enter into your terminal as below: 
git clone <-INSERT URL HERE->

## Dependencies to Install 

The following DEVELOPER DEPENDENCIES are required

    "husky": "^8.0.2",
    "jest": "^27.5.1",
    "jest-date": "^1.1.4",
    "jest-extended": "^2.0.0",
    "sorted": "^0.1.1",
    "supertest": "^6.3.3"

To install each of these, enter the following in the terminal:

    npm install --save -D ** then insert name, with no quotation marks***

   

The following DEPENDENCIES are required for the app to run. 

    "pg-format": "^1.0.4",
    "dotenv": "^16.0.0",
    "express": "^4.18.2",
    "fs.promises": "^0.1.2",
    "pg": "^8.7.3",
    "sort": "^0.0.3",
    "supertest": "^6.3.3"

To install each of these, enter the following in the terminal: 

    npm install ** then insert name, with no quotation marks***

## Setup local databases and Run Seed

Before writing or running any code, you will first need to set local test and develop databases. 

The following script should already be in your package.json under 'scripts'

 "setup-dbs": "psql -f ./db/setup.sql",

In you terminal run the following: 

    npm install setup-dbs

The seed function should run automatically when you run your tests.  If it is not present already, require in the Seed from your DB directory, and your Database connection.  
Ensure you are running a before each function and after all function at the top of the test as follows :

beforeEach(() => seed(testData));

afterAll(() => {
  return db.end();
});

## Version updates

Node.js version 18.12.1 & Postgres version 2.5.12 or later are required 
