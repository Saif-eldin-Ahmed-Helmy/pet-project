require('dotenv').config();
const express = require('express');
const app = express();
const port = 3001;
const connectToDatabase = require('./config/database');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

const mongooseConnectionPromise = connectToDatabase();

app.use(
    session({
        secret: process.env.ACCESS_TOKEN_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
            rolling: true,
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

const usersRouter = require('./routes/Users');
app.use('/api/users', usersRouter);

const itemsRouter = require('./routes/Items');
app.use('/api/items', itemsRouter);

const cartRouter = require('./routes/Cart');
app.use('/api/cart', cartRouter);

const imagesRouter = require('./routes/Images');
app.use('/api/images', imagesRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});