import React, {Component} from 'react';
import {Mutation} from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';
import Form from './styles/Form';
// import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';

const CREATE_ITEM_MUTATION = gql`
    mutation CREATE_ITEM_MUTATION(
        $title: String!
        $description: String!
        $image: String
        $largeImage: String
        $price: Int!
    ) {
        createItem(
            title: $title
            description: $description
            image: $image
            largeImage: $largeImage
            price: $price
        ) {
            id
        }
    }
`;

class CreateItem extends Component {
    state = {
        title: '',
        description: '',
        image: '',
        largeImage: '',
        price: 0
    }

    handleChange = (event) => {
        const {name, type, value} = event.target;
        const val = type === 'number' ? parseFloat(value) : value;
        this.setState({[name]: val});
    }

    uploadImage = async event => {
        // log to console
        console.log('uploading file');
        const files = event.target.files;
        const data = new FormData();
        data.append('file', files[0]);
        data.append('upload_preset', 'shoesfordevs');

        const res = await fetch('https://api.cloudinary.com/v1_1/dx5p60gon/image/upload', {
            method: 'POST',
            body: data
        });
        const file = await res.json();
        console.log(file);
        this.setState({
            image: file.secure_url,
            largeImage: file.eager[0].secure_url
        });
    }

    render() {
        return (
            <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
                {(createItem, {error, loading}) => (
                    <Form onSubmit={async event => {
                        // Stop the form from submitting
                        event.preventDefault();
                        // call the graphql mutation
                        const res = await createItem();
                        // route to the single item page
                        console.log(res);
                        Router.push({
                            pathname: '/product',
                            query: {id: res.data.createItem.id}
                        })
                    }}>
                        <Error error={error} />
                    <fieldset disabled={loading} aria-busy={loading} >
                        <label htmlFor="image">
                            Image
                            <input onChange={this.uploadImage} type="file" id="image" name="image" placeholder="Upload a product image" />
                            {this.state.image && <img width="200" src={this.state.image} alt="image preview" />}
                        </label>
                        <label htmlFor="title">
                            Title
                            <input onChange={this.handleChange} type="text" id="title" name="title" placeholder="Title" value={this.state.title} required />
                        </label>
    
                        <label htmlFor="price">
                            Price
                            <input onChange={this.handleChange} type="number" id="price" name="price" placeholder="price" value={this.state.price} required />
                        </label>
    
                        <label htmlFor="description">
                            Description
                            <textarea onChange={this.handleChange} id="description" name="description" placeholder="Enter A Description" value={this.state.description} required />
                        </label>
                        <button type="submit">Upload Product</button>
                    </fieldset>
                </Form>
                )}
            </Mutation>
            
        )
    }
};

export default CreateItem;
export {CREATE_ITEM_MUTATION};