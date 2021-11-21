# MLTrading

# Setup Instruction

1. Clone the repo
2. Add the .env file to the /server folder
3. Run the following commands
    ```
    $ cd server
    $ yarn install
    $ yarn dev
    ```
4. Now open another terminal to run the client in
    ```
    $ cd client
    $ yarn install

    If you get an error that says "'react-scripts' is not recognized as an internal or external command" then run the following
    $ rm -rf node_modules && yarn install
    Once that is complete then run the following
    $ yarn start
    ```

    Open localhost:3000 to open the react app
5. Download MongoDB from here: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/ 
6. To see the local db in MongoDB Compass, open MongoDB Compass and use what is written in your .env file as the connection string
