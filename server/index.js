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
const {Server} = require('socket.io');
const server = require("http").createServer(app);
const wrap = (expressMiddleWare) => (socket, next) => expressMiddleWare(socket.request, {}, next);

const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
};
const io = new Server(server,{
    cors: corsOptions
});

const chatIo = io.of("/chat");
const chatHandler = require("./handlers/chat");

const sessionMiddleware =
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
    });

app.use(cors(corsOptions));

io.use(wrap(sessionMiddleware));
io.on('connection', async (socket) => {
    if (!socket.request.session.passport || !socket.request.session.passport.user) {
        socket.disconnect();
        return;
    }
    const user = await User.findOne({email: socket.request.session.passport.user});
    if (!user) {
        socket.disconnect();
        return;
    }
    socket.request.session.role = user.role;
    socket.join(socket.request.session.passport.user); //Join a room with your user ID
    console.log('a user connected', socket.request.session.passport.user, socket.request.session.role);
    if (socket.request.session.role === 'admin' || socket.request.session.role === 'doctor') {
        socket.join('vet'); //Join a room for vets
    }
    if (socket.request.session.role === 'admin' || socket.request.session.role === 'support') {
        socket.join('support'); //Join a room for support
    }

    socket.on('send-notification', (data) => {
            console.log('Socket message: ' + data.SendToId + ' ' + data.message);
            io.to(data.SendToId).emit("new-notification", data);
        }
    );


    socket.on('disconnect', () => {
        console.log('a user disconnected', socket.request.session.passport.user);
        }
    );
});
global.io = io;

app.use(express.json());
app.use(cookieParser());

const mongooseConnectionPromise = connect();

console.log(process.env.MONGODB_URI);

app.use(sessionMiddleware);

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
const User = require("./models/User");
 app.use('/api/chats', chatsRouter);