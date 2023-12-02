require('dotenv').config();

const express = require('express');
const app = express();
const port = 3002;
const database = require('./config/database');

app.use(express.json());

const usersRouter = require('./routes/Users');
app.use('/api/users', usersRouter);

// test queries if you wanna try:

// to login
// GET /api/users?email=test&password=test
// will return a json web token if the email and password are correct

// to register an account
// POST /api/users
// Body: { "email": "test@test", "password": "test", "name": "test" }
// will return a json web token if the email is not already taken and it added the user to the database

// dm me on discord when you wake up!!! need to discuss some stuff

const itemsRouter = require('./routes/Items');
app.use('/api/items', itemsRouter);

const cartRouter = require('./routes/Cart');
app.use('/api/cart', cartRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});