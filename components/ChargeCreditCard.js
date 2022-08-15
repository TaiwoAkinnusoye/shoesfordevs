import React from 'react';
import StripeCheckout from 'react-stripe-checkout';
import {Mutation} from 'react-apollo';
import Router from 'next/router';
import NProgress from 'nprogress';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import calcTotalPrice from '../lib/calcTotalPrice';
import Error from './ErrorMessage';
import User, {CURRENT_USER_QUERY} from './User';
import { NULL } from 'graphql/language/kinds';

const CHARGE_CREDITCARD_MUTATION = gql`
    mutation CHARGE_CREDITCARD_MUTATION($token: String!) {
        createOrder(token: $token) {
            id
            charge
            total
            items {
                id
                title
            }
        }
    }
`;

class ChargeCreditCard extends React.Component{

    totalItems = (cart) => {
        return cart.reduce((tally, cartItem) => {return tally + cartItem.quantity}, 0)
    }

    onToken = async (res, createOrder) => {
        NProgress.start();
        // manually call the createOrder mutation
        // once we recieve the stripe token
        const order = await createOrder({
            variables: {
                token: res.id
            }
        }).catch(err => alert(err.message));
        Router.push({
            pathname: '/order',
            query: {id: order.data.createOrder.id}
        })
    }

    render() {
        return (
            <User>
                {({data: {currentUser}, loading}) => {
                    if(loading) return null;
                return (
                    <Mutation mutation={CHARGE_CREDITCARD_MUTATION} refetchQueries={[{
                        query: CURRENT_USER_QUERY
                    }]}>
                        {(createOrder) => (
                            
                    <StripeCheckout amount={calcTotalPrice(currentUser.cart)} 
                    name="Shoes For Devs" 
                    description={`Order of ${this.totalItems(currentUser.cart)} items`} 
                    image={currentUser.cart.length && currentUser.cart[0].item && currentUser.cart[0].item.image}
                    stripeKey="pk_test_uFhIQDGoIwnnq5vxInSkFKEX00i6y4sbl9"
                    currency="USD"
                    email={currentUser.email}
                    token={res => this.onToken(res, createOrder)}
                    >{this.props.children}</StripeCheckout>
                    )}
                    </Mutation>
                )}}
            </User>
        )
    }
}

export default ChargeCreditCard;
export {CHARGE_CREDITCARD_MUTATION}