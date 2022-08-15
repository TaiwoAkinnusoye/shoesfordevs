import React, {Component} from 'react';
import {Mutation} from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';

const REQUEST_RESET_MUTATION = gql`
    mutation REQUEST_RESET_MUTATION ($email: String!) {
        requestReset(email: $email) {
            message
        }
    }
`;

class RequestReset extends Component {

    state = {
        email: ""
    }

    saveToState = (event) => {
        this.setState({[event.target.name] : event.target.value})
    }

    render () {
        return (
            <Mutation mutation={REQUEST_RESET_MUTATION}
             variables={this.state}>
                {(requestReset, {error, loading, called}) => {
                return (<Form method="post" data-test="form" onSubmit={async (event) => {
                    event.preventDefault();
                    await requestReset();
                    this.setState({email: ''});
                }}>
                <fieldset disabled={loading} aria-busy={loading}>
                    <h2>Forgot Password?</h2>
                    <Error error={error} />
                    {!error && !loading && called && <p>Check your email for password reset link.</p>}
                    <label htmlFor="email">
                        Email
                        <input type="email" name="email" placeholder="email" value={this.state.email} onChange={this.saveToState} />
                    </label>
                    <button type="submit">Password Reset</button>
                </fieldset>
            </Form>)
            }}
            </Mutation>
        )
    }
};

export default RequestReset;
export {REQUEST_RESET_MUTATION};