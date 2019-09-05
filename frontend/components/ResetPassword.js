import React, {Component} from 'react';
import {Mutation} from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import Form from './styles/Form';
import Error from './ErrorMessage';
import {CURRENT_USER_QUERY} from './User';

const RESET_PASSWORD_MUTATION = gql`
    mutation RESET_PASSWORD_MUTATION ($resetToken: String!, $password: String!, $confirmPassword: String!) {
        resetPassword(resetToken: $resetToken, password: $password, confirmPassword: $confirmPassword) {
            name
            email
            id
        }
    }
`;

class ResetPassword extends Component {
    static propTypes = {
        resetToken: PropTypes.string.isRequired
    }

    state = {
        password: "",
        confirmPassword: ""
    }

    saveToState = (event) => {
        this.setState({[event.target.name] : event.target.value})
    }

    render () {
        return (
            <Mutation mutation={RESET_PASSWORD_MUTATION} refetchQueries={[{
                query: CURRENT_USER_QUERY
            }]}
             variables={{
                 resetToken : this.props.resetToken,
                 password : this.state.password,
                 confirmPassword: this.state.confirmPassword
             }}>
                {(resetPassword, {error, loading}) => {
                return (<Form method="post" onSubmit={async (event) => {
                    event.preventDefault();
                    await resetPassword();
                    this.setState({password: '', confirmPassword: ''});
                }}>
                <fieldset disabled={loading} aria-busy={loading}>
                    <h2>Reset Your Password</h2>
                    <Error error={error} />
                    <label htmlFor="password">
                        Password
                        <input type="password" name="password" placeholder="password" value={this.state.password} onChange={this.saveToState} />
                    </label>

                    <label htmlFor="confirmPassword">
                        Confirm Password
                        <input type="password" name="confirmPassword" placeholder="Confirm Password" value={this.state.confirmPassword} onChange={this.saveToState} />
                    </label>
                    <button type="submit">Reset Your Password</button>
                </fieldset>
            </Form>)
            }}
            </Mutation>
        )
    }
};

export default ResetPassword;