import {Query, Mutation} from 'react-apollo';
import Error from './ErrorMessage';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import Table from './styles/Table';
import SickButton from './styles/SickButton';

const ALL_USERS_QUERY = gql`
    query ALL_USERS_QUERY {
        users {
            id
            name
            email
            permissions
        }
    }
`;

const UPDATE_PERMISSIONS_MUTATION = gql`
    mutation UPDATE_PERMISSIONS_MUTATION($permissions: [Permission], $userId: ID!) {
        updatePermissions(permissions: $permissions, userId: $userId) {
            id
            name
            email
            permissions
        }
    }
`;

const possiblePermissions = [
    'USER', 'ADMIN', 'PERMISSIONUPDATE', 'ITEMCREATE', 'ITEMUPDATE', 'ITEMDELETE'
];

const Permissions = (props) => (
    <Query query={ALL_USERS_QUERY}>
        {({data, loading, error}) => (
            <div>
            <Error error={error}/>
              <div>
                  <h2>Manage Permissions </h2>
                  <Table>
                      <thead>
                          <tr>
                              <th>Name</th>
                              <th>Email</th>
                              {possiblePermissions.map(permission => <th key={Math.random()}>{permission}</th>)}
                              <th>Give Permission</th>
                          </tr>
                      </thead>
                      <tbody>
                        {data.users.map(user => <UserPermissions user={user} key={user.id} />)}
                      </tbody>
                  </Table>
              </div>
            </div>
        )}
    </Query>
);

class UserPermissions extends React.Component {
    static propTypes = {
        user: PropTypes.shape({
            name: PropTypes.string,
            email: PropTypes.string,
            id: PropTypes.string,
            permissions: PropTypes.araay,            
        }).isRequired
    };
    
    state = {
        permissions: this.props.user.permissions
    }

    handlePermissionChange = (event) => {
        const checkBox = event.target;
        // take a copy of the current permissions
        let updatedPermissions = [...this.state.permissions];
        // figure out if we need to remove or add this permission
        if (checkBox.checked) {
            // add permission
            updatedPermissions.push(checkBox.value);
        } else {
            updatedPermissions = updatedPermissions.filter(permission => permission !== checkBox.value);
        }
        this.setState({permissions: updatedPermissions});
    }

    render() {
        const user = this.props.user;
        return (
            <Mutation mutation={UPDATE_PERMISSIONS_MUTATION} variables={{
                permissions: this.state.permissions,
                userId: this.props.user.id
            }}>
                {(updatePermissions, {loading, error}) => (   
            <> 
            {error && <tr><td colSpan="8"><Error error={error} /></td></tr>}
            <tr>
                <td>{user.name}</td>
                <td>{user.email}</td>
                {possiblePermissions.map(permission => (
                    <td key={Math.random()}>
                        <label htmlFor={`${user.id}-permission-${permission}`}>
                            <input 
                             id={`${user.id}-permission-${permission}`}
                            type="checkbox" 
                            checked ={this.state.permissions.includes(permission)}
                            value={permission} onChange={this.handlePermissionChange} />
                        </label>
                    </td>
                ))}
                <td>
                    <SickButton type="button" disabled={loading} onClick={updatePermissions}>Updat{loading ? 'ing' : 'e'}</SickButton>
                </td>
            </tr>
            </>
                )}
            </Mutation>
        )
    }
}

export default Permissions;