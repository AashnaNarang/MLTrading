# MLTrading

# Setup Instruction

1. Make sure you have a version of Node.js installed that is higher than version 14.0.0. Use https://nodejs.org/en/download/ to download Node.js
2. Clone the repo
3. Add the .env file to the /server folder
4. Run the following commands
    ```
    $ cd server
    $ yarn install
    $ yarn dev
    ```
5. Now open another terminal to run the client in
    ```
    $ cd client
    $ yarn install

    If you get an error that says "'react-scripts' is not recognized as an internal or external command" then run the following
    $ rm -rf node_modules && yarn install
    Once that is complete then run the following
    $ yarn start
    ```

    Open localhost:3000 to open the react app
6. Download MongoDB from here: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/ 
7. To see the local db in MongoDB Compass, open MongoDB Compass and use what is written in your .env file as the connection string
