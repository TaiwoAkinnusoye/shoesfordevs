import React, {Component} from 'react';
import {Mutation, Query} from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';
import Form from './styles/Form';
// import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';

const SINGLE_ITEM_QUERY = gql`
    query SINGLE_ITEM_QUERY($id: ID!) {
        item(where: {id: $id}) {
            id
            title
            description
            price
        }
    }
`;

const UPDATE_ITEM_MUTATION = gql`
    mutation UPDATE_ITEM_MUTATION(
        $id: ID!
        $title: String
        $description: String
        $price: Int
    ) {
        updateItem(
            id: $id
            title: $title
            description: $description
            price: $price
        ) {
            id
            title
            description
            price
        }
    }
`;

class UpdateItem extends Component {
    state = {    }

    handleChange = (event) => {
        const {name, type, value} = event.target;
        const val = type === 'number' ? parseFloat(value) : value;
        this.setState({[name]: val});
    }

    updateItem = async (event, updateItemMutaion) => {
        event.preventDefault();
        console.log('Updating Item!!');
        console.log(this.state);
        const res = await updateItemMutaion({
            variables: {
                id: this.props.id,
                ...this.state
            }
        });
        console.log('Updated!');
    }

    render() {
        return (
            <Query query={SINGLE_ITEM_QUERY} variables={{id: this.props.id}}>
                {({loading, data}) => {
                    if(loading) return <p>Loading...</p>;
                    if(!data.item) return <p>No Product Found for {this.props.id}</p>
                    return (
            <Mutation mutation={UPDATE_ITEM_MUTATION} variables={this.state}>
                {(updateItem, {error, loading}) => (
                    <Form onSubmit={event => this.updateItem(event, updateItem)}>
                        <Error error={error} />
                    <fieldset disabled={loading} aria-busy={loading} >
                        
                        <label htmlFor="title">
                            Title
                            <input onChange={this.handleChange} type="text" id="title" name="title" placeholder="Title" defaultValue={data.item.title} required />
                        </label>
    
                        <label htmlFor="price">
                            Price
                            <input onChange={this.handleChange} type="number" id="price" name="price" placeholder="price" defaultValue={data.item.price} required />
                        </label>
    
                        <label htmlFor="description">
                            Description
                            <textarea onChange={this.handleChange} id="description" name="description" placeholder="Enter A Description" defaultValue={data.item.description} required />
                        </label>
                        <button type="submit">Updat{loading ? 'ing': 'e'} Product</button>
                    </fieldset>
                </Form>
                )}
            </Mutation>
         )
                }}
            </Query>   
        )
    }
};

export default UpdateItem;
export {UPDATE_ITEM_MUTATION};