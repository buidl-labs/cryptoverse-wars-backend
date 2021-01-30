# Cryptoverse Wars Backend

## Stack -
1. [NodeJS](https://nodejs.org/en/)
2. [Express.js](https://expressjs.com/)
3. [PostgreSQL](https://www.postgresql.org/)
4. [Sequelize](https://sequelize.org/)


## Installation Instructions

1. Install all dependencies

    - Run `yarn install` 

2. Set environment variables
    1. Create account from https://pinata.cloud/ to generate the API keys.
    2. Create a `env` file and copy the fields required from `.env.sample`.
    3. Fill-in your API keys from **Pinata** in the `.env` file.
    
3. Setup the database
    1. Start a **PostgreSQL** database.
    2. Add the **PostgreSQL** connection string as `DB_URL_DEV`
    3. Connection string will look like this - `"postgresql://[user]:[password]@localhost:5432/[db_name]"`

4. Seed the database
    1. In `app.js` - uncomment these two lines in the end - 
    ```
    await sequelize.sync({ force: true });
	addChapter(Module, Chapter);
	```
	- This will create all the tables(drop all of them if they already exist) and also populate the `chapter` and `module` table.
	

**Start local build:**
1. Development server(auto re-load on file change) - 
    ```
    yarn run dev
    ```
2. Serve without auto re-load - 
    ```
    yarn start
    ```