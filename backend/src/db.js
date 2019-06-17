// This file connects to the remote prisma db,
// and gives us the abiltiy to query and mutate it with JavaScript
const {Prisma} = require('prisma-binding');

const db = new Prisma({
    typeDefs: "src/generated/prisma.graphql",
    endpoint: process.env.PRISMA_ENDPOINT,
    secret: process.env.PRISMA_SECRET,
    debug: true,
});

module.exports = db;
