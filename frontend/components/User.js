import {Query} from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';

const CURRENT_USER_QUERY = gql`
    query CURRENT_USER_QUERY{
        currentUser {
            id
            name
            email
            permissions
            orders {
                id
            }
            cart {
            id
            quantity
            item {
                id
                price
                title
                description
                image
            }
        }
        }
    }
`;

const User = (props) => (
    <Query {...props} query={CURRENT_USER_QUERY}>
        {payload => props.children(payload)}
    </Query>
);

User.propTypes = {
    children: PropTypes.func.isRequired
};

export default User;
export {CURRENT_USER_QUERY};