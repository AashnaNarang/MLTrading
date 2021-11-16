# ML-Trading2

# Setup Instruction

1. Clone the repo
2. Run the following commands
    ```
    $ cd server
    $ yarn install
    $ yarn dev
    ```
3. Now open another terminal to run the client in
    ```
    $ cd client
    $ npm i

    If you get an error that says "'react-scripts' is not recognized as an internal or external command" then run the following
    $ rm -rf node_modules && npm install
    Once that is complete then run the following
    $ npm start
    ```

    Open localhost:3000 to open the react app
4. Download MongoDB from here: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/ 
5. To see the local db in MongoDB Compass, open MongoDB Compass and use what is written in your .env file as the connection string