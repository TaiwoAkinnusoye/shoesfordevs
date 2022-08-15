import React, {Component} from 'react';
import {Mutation} from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {CURRENT_USER_QUERY} from './User';


const REMOVE_FROM_CART_MUTATION = gql`
    mutation REMOVE_FROM_CART_MUTATION($id: ID!) {
        removeFromCart(id: $id) {
            id
        }
    }
`

const RemoveButton = styled.button`
    font-size: 30px;
    background: none;
    border: none;
    &:hover {
        color: ${props => props.theme.palevioletred};
        cursor: pointer;
    }
`;

class RemoveFromCart extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired
    }

    // This update function gets called as soon as we get a response back from the server after a mutation has been called
    update = (cache, payload) => {
        // manually update the cache on the client, so it matches the server
            // 1. read the cache for the cart items we want
            const data = cache.readQuery({query:CURRENT_USER_QUERY});
            // 2.Filter the deleted cart item out of the cart
            const cartItemId = payload.data.removeFromCart.id;
            data.currentUser.cart = data.currentUser.cart.filter(cartItem => cartItem.id !== cartItemId)
            // 3. Put the cart items back
            cache.writeQuery({query: CURRENT_USER_QUERY, data})
    }

    render () {
        return (
            <Mutation mutation={REMOVE_FROM_CART_MUTATION} variables={{
                id: this.props.id
            }} update={this.update} optimisticResponse={{
                __typename: 'Mutation',
                removeFromCart: {
                    __typename: "CartItem",
                    id: this.props.id
                }
            }}>
                {(removeFromCart, {loading, error}) => (
                    <RemoveButton onClick={() => {
                        removeFromCart().catch(err => alert(err.message))
                    }} title="Delete Item" disabled={loading}>&times;</RemoveButton>
                )}
            
            </Mutation>
        )
    }
}

export default RemoveFromCart;
export {REMOVE_FROM_CART_MUTATION};