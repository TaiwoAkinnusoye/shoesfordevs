import React, { Component } from 'react';
import {Mutation} from 'react-apollo';
import gql from 'graphql-tag';
import {CURRENT_USER_QUERY} from './User';

const ADDTOCART_MUTATION = gql`
    mutation ADDTOCART_MUTATION($id: ID!) {
        addToCart(id: $id) {
            id
            quantity
        }
    }
`;

class AddToCart extends Component {
    render() {
        const {id} = this.props
        return (
        <Mutation mutation={ADDTOCART_MUTATION} variables={{
            id
        }} refetchQueries={[
            {query: CURRENT_USER_QUERY}
        ]}>
            {(addToCart, {loading}) => (
                <button onClick={() => {
                    addToCart().catch(err => alert(err.message))
                }} disabled={loading}>Add{loading ? 'ing' : ''} To Cart</button>  
            )}
        </Mutation>
        )
    }
}

export default AddToCart;
export {ADDTOCART_MUTATION}