require("dotenv").config({ path: "variables.env" });
const createServer = require("./createServer");
const db = require("./db");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const server = createServer();

// use express middleware to handle cookies (JWT)
server.express.use(cookieParser());

// decode the JWT so we can get the user id on each request
server.express.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    // put the user id on to the request for
    // further requests to access
    req.userId = userId;
  }
  next();
});

// Create a middleware that populates the user on each request
server.express.use(async (req, res, next) => {
  // if they aren't logged in, skip this
  if (!req.userId) return next();

  const user = await db.query.user(
    { where: { id: req.userId } },
    "{id, email, name, permissions}"
  );
  req.user = user;
  next();
});

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  details => {
    console.log(`Server is now running on http://localhost:${details.port}`);
  }
);
