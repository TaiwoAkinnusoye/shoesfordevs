const cookieParser = require('cookie-parser');
require('dotenv').config({path: 'variables.env'});
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// use express middleware to handle cookies (JWT)
server.express.use(cookieParser());

// decode the JWT so we can get the user id on each request
server.express.use((req, res, next)=> {
    console.log('Hey, i am a middleware');
    next();
});

server.start({
    cors: {
        credentials: true,
        origin: process.env.FRONTEND_URL,
    }}, 
    details => {
    console.log(`Server is now running on http://localhost:${details.port}`);
})