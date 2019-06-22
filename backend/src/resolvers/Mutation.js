// imports
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {randomBytes} = require('crypto');
const {promisify} = require('util');

// Mutation Functions for use on front-end 
const Mutations = {
    async createItem(parent, args, ctx, info) {
    // Todo check if they are logged in

    const item = await ctx.db.mutation.createItem({
        data: {
            ...args
        }}, info);
        return item;
    },

    updateItem(parent, args, ctx, info) {
        // first take a copy of the updates
        const updates = {...args};
        // remove the id from the updates
        delete updates.id;
        // run the update method
        return ctx.db.mutation.updateItem({
            data: updates,
            where: {
                id: args.id
            }
        }, info);
    },

    async deleteItem(parent, args, ctx, info) {
        const where = {id: args.id};
        // 1. find the item
        const item = await ctx.db.query.item({where}, `{
            id
            title
        }`);
        // 2. Check if they own that item, or have the permissions
            // TODO:
        // 3. Delete the item
        return ctx.db.mutation.deleteItem({where}, info);
    },
    
    async signup(parent, args, ctx, info) {
        // Lowercase their email addresses
        args.email = args.email.toLowerCase();
        // Hash their password
        const password = await bcrypt.hash(args.password, 10);
        // create the user in the database
        const user = await ctx.db.mutation.createUser({
            data: {
                ...args,
                password: password,
                permissions: {set: ['USER']},
            }
        }, info);
        // create the JWT token for the user
        const token = jwt.sign({userId: user.id}, process.env.APP_SECRET);
        // set the JWT as a cookie on the response
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365 // 1 Year Cookie
        });
        // return the user to the browser
        return user;
    },

    async signin(parent, args, ctx, info) {
        // 1. check if there is a user with that email
        const user = await ctx.db.query.user({
            where: {
                email: args.email
            }
        });
        if (!user) {
            throw new Error(`No such user found for ${args.email}`);
        }
        // 2. check if theri password is correct
        const valid = await bcrypt.compare(args.password, user.password);
        if(!valid) {
            throw new Error(`Invalid Password!`);
        }
        // 3. generate the jwt token
        const token = jwt.sign({userId: user.id}, process.env.APP_SECRET);
        // 4. set the cookie with the token
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365 //One year cookie
        })
        // 5. return the user
        return user;
    },

    signout(parent, args, ctx, info) {
        ctx.response.clearCookie('token');
        return {message: 'Good Bye!'};
    },

    async requestReset(parent, args, ctx, info) {
        // 1. check if this is a real user
        const user  = await ctx.db.query.user({where:{
            email: args.email
        }});
        if (!user) {
            throw new Error(`No such user found for ${args.email}`);
        }
        // 2. set a reset token and expiry on that user
        const randomBytesPromisified = promisify(randomBytes);
        const resetToken =  (await randomBytesPromisified(20)).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; //One hour from now
          // 2.1 take variables created above and save them to user
          const res = await ctx.db.mutation.updateUser({
              where : {email: args.email},
              data : {resetToken, resetTokenExpiry}
          });
          console.log(res);
          return {message: 'Thanks!'};
        // 3.email them the reset token
    },
    async resetPassword(parent, args, ctx, info) {
        // 1. confirm if passwords match
        // 2. check if it is a legit reset token
        // 3. check if the reset token is expired
        // 4. hash the new password
        // 5. save the new password to the and remove old resetToken fields
        // 6. generate JWT
        // 7. set the JWT cookie
        // 8. return the new user
        // 9. take a break 
    }
};

module.exports = Mutations;
