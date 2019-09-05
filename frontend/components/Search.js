import React from 'react';
import Downshift, {resetIdCounter} from 'downshift';
import Router from 'next/router';
import {ApolloConsumer} from 'react-apollo';
import gql from 'graphql-tag';
import debounce from 'lodash.debounce';
import { DropDown, DropDownItem, SearchStyles } from './styles/DropDown';

const SEARCH_ITEMS_QUERY = gql`
    query SEARCH_ITEMS_QUERY($searchTerm: String!) {
        items(where: {
            OR: [{title_contains: $searchTerm},{
                description_contains: $searchTerm}]}) 
                {
                    id
                    title
                    image
        }
    }
`;

class AutoComplete extends React.Component {

    state = {
        items: [],
        loading: false
    }

    handleSearch = debounce(async (event, client) => {
        // Turn loading on
        this.setState({loading: true})
        // Manually query the Apollo Client
        const res = await client.query({
            query: SEARCH_ITEMS_QUERY,
            variables: { searchTerm: event.target.value}
        });
        this.setState({items: res.data.items, loading: false})
    }, 350);

    routeToItem = (item) => {
        Router.push({
            pathname: '/product',
            query: {
                id: item.id
            }
        })
    }

    render () {
        resetIdCounter();
        return (
            <SearchStyles>
                <Downshift onChange={this.routeToItem} itemToString={item => (item === null ? '' : item.title)}>
                    {({getInputProps, getItemProps, isOpen, inputValue, highlightedIndex}) => (
                <div>
                    <ApolloConsumer>
                        {(client) => (
                    <input {...getInputProps({
                        type: "search",
                        placeholder: "search for items",
                        id: "search",
                        className: this.state.loading ? 'loading': '',
                        onChange: (event) => {event.persist();
                            this.handleSearch(event, client) }
                    })}
                     />
                        )}
                    </ApolloConsumer>
                    {isOpen && (
                    <DropDown>
                        {this.state.items.map((item, index) => (
                            <DropDownItem 
                            {...getItemProps({item})}
                            key={item.title} highlighted={index === highlightedIndex}>
                                <img width="50" src={item.image} alt={item.title} />
                                {item.title}
                            </DropDownItem>
                        ))}
                        {!this.state.items.length && !this.state.loading && (
                            <DropDownItem>
                                Nothing Found for {inputValue}
                            </DropDownItem>
                        ) }
                    </DropDown>
                    )}
                </div>
                )}
                </Downshift>
                </SearchStyles>
        )
    }
}

export default AutoComplete;