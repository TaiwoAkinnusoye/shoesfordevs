// imports
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {randomBytes} = require('crypto');
const {promisify} = require('util');
const {hasPermission} = require('../utils');
const {transport, makeANiceEmail} = require('../mail');
const stripe = require('../stripe');

// Mutation Functions for use on front-end 
const Mutations = {
    async createItem(parent, args, ctx, info) {
    // check if the user is logged in
    if(!ctx.request.userId) {
        throw new Error('You must be logged in to create an item')
    }

    const item = await ctx.db.mutation.createItem({
        data: {
            // this is how we create a relationship between the Item and the User
            user: {
                connect: {
                    id: ctx.request.userId
                }
            },
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
            user {
                id
            }
        }`);
        // 2. Check if they own that item, or have the permissions
        
        const ownsItem = item.user.id === ctx.request.userId;
        
        const hasPermissions = ctx.request.user.permissions.some(permission => ['ADMIN', 'ITEMDELETE'].includes(permission));

        if(!ownsItem && !hasPermissions) {
            throw new Error(`You don't have permission to do that!`)
        }
        
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
                password,
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
            throw new Error(`No such user found for email ${args.email}`);
        }
        // 2. check if their password is correct
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
        // 3. email them the reset token
        const mailRes = await transport.sendMail({
            from: 'taiwo@ochulo.com',
            to: user.email,
            subject: 'Your Password Reset Token',
            html: makeANiceEmail(`Your password reset token is here! \n\n <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to reset password</a>`)
        })
        // 4. return the message
        return {message: 'Thanks!'};

    },

    async resetPassword(parent, args, ctx, info) {
        // 1. confirm if passwords match
        if (args.password !== args.confirmPassword) {
            throw new Error("Your passwords don't match?!");
        }
        // 2. check if it is a legit reset token and
        // 3. check if the reset token is expired
        const [user] = await ctx.db.query.users({
            where : {
                resetToken : args.resetToken,
                resetTokenExpiry_gte: Date.now() - 3600000
            }
        });
        if (!user) {
            throw new Error('This token is either invalid or expired');
        }
        // 4. hash the new password
        const password = await bcrypt.hash(args.password, 10);
        // 5. save the new password to the and remove old resetToken fields
        const updatedUser = await ctx.db.mutation.updateUser({
            where : {email : user.email},
            data : {
                password,
                resetToken: null,
                resetTokenExpiry: null
            }
        });
        // 6. generate JWT
        const token = jwt.sign({userId: updatedUser.id},process.env.APP_SECRET);
        // 7. set the JWT cookie
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365
        });
        // 8. return the new user
        return updatedUser;
    },

    async updatePermissions(parent, args, ctx, info) {
        // 1. check if they're logged in
        if(!ctx.request.userId) {
            throw new Error('You must be logged in!');
        }
        // 2. query the current user
        const currentUser = await ctx.db.query.user({
            where: {
                id: ctx.request.userId
            }
        }, info)
        // 3. check if they have permissions to do this
        hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
        // 4. update the permissions
        return ctx.db.mutation.updateUser({
            data: {
                permissions: {
                    set: args.permissions
            }
        },
            where: {
                id: args.userId
            }
        }, info)
    },
    async addToCart(parent, args, ctx, info) {
        // 1. check if the user is logged in
        const {userId} = ctx.request;
        if(!userId) {
            throw new Error(`You have to be signed in to add to cart`);
        }
        // 2. query the current user's cart
        const [existingCartItem] = await ctx.db.query.cartItems({
            where : {
                user: {id: userId},
                item: {id: args.id}
            }   
        }, info)
        // 3. check if that item is already in their cart and increment by 1 if it is
        if(existingCartItem) {
            console.log('This item is already in their cart!');
            return ctx.db.mutation.updateCartItem({
                where: {id: existingCartItem.id},
                data: {quantity: existingCartItem.quantity + 1}
            }, info)
        }
        // 4. if it's not create a fresh CartItem
        return ctx.db.mutation.createCartItem({
            data: {
                user: {connect: {id: userId}},
                item: {connect: {id: args.id}}
            }
        }, info)
    },
    async removeFromCart(parent, args, ctx, info) {
        // 1. Find the cart item
        const cartItem = await ctx.db.query.cartItem({
            where: {
                id: args.id
            }
        }, `{id, user { id }}`);
        // 1.5 check to see if an item was found in the cart
        if(!cartItem) {
            throw new Error('No Item found in the cart')
        }
        // 2. Check if the user owns that cart item
        if (cartItem.user.id !== ctx.request.userId) {
            throw new Error(`You don't belong here!!!`);
        }
        // 3. Delete the found cart item
        return ctx.db.mutation.deleteCartItem({
            where: {
                id: args.id
            }
        }, info)
    },

    async createOrder(parent, args, ctx, info) {
        // 1. query the user and make sure they are signed in
        const {userId} = ctx.request;
        if(!userId) {
            throw new Error('User Not logged in to complete this order')
        };
        const user = await ctx.db.query.user({where: {
            id: userId
        }}, `
        {
            id
            name 
            email 
            cart{ 
                id 
                quantity 
                item { 
                    title 
                    price 
                    id 
                    description 
                    image
                    largeImage
                }}}`)
        // 2. recalculate the total for the price
        const amount = user.cart.reduce((tally, cartItem) => tally + cartItem.item.price * cartItem.quantity, 0);   console.log(`going to charge for a total of ${amount}`) 
        // 3. create the stripe charge (turn token into money)
        const charge = await stripe.charges.create({
            amount,
            currency: 'USD',
            source: args.token
        })
        // 4. convert the cartItems to orderItems
        const orderItems = user.cart.map(cartItem => {
            const orderItem = {
                quantity: cartItem.quantity,
                user: {
                    connect: {
                        id: userId
                    }
                },
                ...cartItem.item
            }
            delete orderItem.id;
            return orderItem;
        });
        // 5. create the order
        const order = await ctx.db.mutation.createOrder({
            data: {
                total: charge.amount,
                charge: charge.id,
                items: {create: orderItems},
                user: {connect: {id: userId}},
            }
        })
        // 6. clean up: clear the user's cart , delete CartItems
        const cartItemIds = user.cart.map(cartItem => cartItem.id);
        await ctx.db.mutation.deleteManyCartItems({
            where: {id_in: cartItemIds}
        })
        // 7. return the order to the client
        return order;
    }
};

module.exports = Mutations;
