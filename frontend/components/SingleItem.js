import React, {Component} from 'react';
import {Query} from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Head from 'next/head';
import Error from './ErrorMessage';
import formatMoney from '../lib/formatMoney';

const SingleItemStyles = styled.div`
    max-width: 1200px;
    margin: 1rem auto;
    box-shadow: ${props => props.theme.bs};
    display: grid;
    grid-auto-columns: 1fr;
    grid-auto-flow: column;
    min-height: 500px;
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .details {
        margin: 20px;
        font-size: 20px;
    }
`;

const SINGLE_ITEM_QUERY = gql`
    query SINGLE_ITEM_QUERY($id: ID!) {
        item(where: {id: $id}) {
            id
            title
            description
            price
            largeImage
        }
    }
`;

class SingleItem extends Component {
render () {
    return (
        <Query query={SINGLE_ITEM_QUERY} variables={{id: this.props.id}}>
            {({error, loading, data}) => {
                if (error) return <Error error={error}/>;
                if (loading) return <p>Loading...</p>;
                if (!data.item) return <p>Sorry, No Product found for {this.props.id}</p>;
                const product = data.item;
                return <SingleItemStyles>
                    <Head>
                        <title>Shoes For Devs! | {product.title}</title>
                    </Head>
                    <img src={product.largeImage} alt={product.title} />
                    <div className="details">
                        <h2>{product.title}</h2>
                        <hr />
                        <h3>{formatMoney(product.price)}</h3>
                        <hr />
                        <p>{product.description}</p>
                    </div>
                </SingleItemStyles>;
            }}
        </Query>
    )
};
}
export default SingleItem;