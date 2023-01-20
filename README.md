# NK News API

# Project Summary

An lite News application featuring stories posted by members of our community, with topics including cats, Mitch, coding, and much more! 

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

    npm install --save -D **insert name, with no quotation marks***

    (no quotations marks require)

The following DEPENDENCIES are required for the app to run. 

    "pg-format": "^1.0.4",
    "dotenv": "^16.0.0",
    "express": "^4.18.2",
    "fs.promises": "^0.1.2",
    "pg": "^8.7.3",
    "sort": "^0.0.3",
    "supertest": "^6.3.3"