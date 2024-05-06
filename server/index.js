require('dotenv').config();
const express = require('express');
const app = express();
const port = 3001;
const [connect, getClient] = require('./config/database');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const server = require('http').createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
    }
});

const chatIo = io.of("/chat");
const chatHandler = require("./handlers/chat");

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

const mongooseConnectionPromise = connect();

console.log(process.env.MONGODB_URI);

app.use(
    session({
        secret: process.env.ACCESS_TOKEN_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
        }),
        cookie: {
            secure: process.env.NODE_ENV === 'production', // set secure to true in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // set sameSite to 'none' in production and 'lax' in development
            maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
            rolling: true,
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());


chatHandler(chatIo);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
 const usersRouter = require('./routes/Users');
 app.use('/api/users', usersRouter);

 const itemsRouter = require('./routes/Items');
 app.use('/api/items', itemsRouter);

 const cartRouter = require('./routes/Cart');
 app.use('/api/cart', cartRouter);

 const imagesRouter = require('./routes/Images');
 app.use('/api/images', imagesRouter);

 const ordersRoute = require('./routes/Orders');
 app.use('/api/orders', ordersRoute);

 const analysisRoute = require('./routes/Analysis');
 app.use('/api/analysis', analysisRoute);

 const chatsRouter = require('./routes/Chats');
 app.use('/api/chats', chatsRouter);