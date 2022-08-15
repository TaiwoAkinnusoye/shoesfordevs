const {forwardTo} = require('prisma-binding');
const {hasPermission} = require('../utils');

const Query = {
items: forwardTo('db'),
item: forwardTo('db'),
itemsConnection: forwardTo('db'),
currentUser(parent, args, ctx, info) {
    // check if there is a current user id
    if(!ctx.request.userId) {
        return null;
    }
    return  ctx.db.query.user({
        where: {
            id: ctx.request.userId
        }
    }, info);
},
async users(parent, args, ctx, info) {
// 0. check if they're logged in
if (!ctx.request.userId) {
    throw new Error('You must be logged in')
}
// 1. check if the user has the permissions to query all the users
hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);
// 2. if they do, query all the users
return ctx.db.query.users({}, info);
},
async order(parent, args, ctx, info) {
    // 1. make sure they are logged in
    if(!ctx.request.userId) {
        throw new Error(`You're not logged in`)
    }
    // 2. query the current order
    const order = await ctx.db.query.order({
        where: {
            id: args.id
        }
    }, info)
    // 3. check if they have the permissions to see
    // this order
    const ownsOrder = order.user.id === ctx.request.userId;
    const hasPermissiontoSeeOrder = ctx.request.user.permissions.includes('ADMIN');

    if (!ownsOrder || !hasPermissiontoSeeOrder) {
        throw new Error(`You can't see this`);
    }
    // 4. return the order
    return order;
},
async orders(parent, args, ctx, info) {
    // 1. get the user's id
    const {userId} = ctx.request;
    // 2. check if they are logged in
    if(!userId) {
        throw new Error(`You're not logged in. Please log in.`)
    }
    // 3. return the orders
    return ctx.db.query.orders({where: {user: {id: userId}}}, info)
}
};

module.exports = Query;
