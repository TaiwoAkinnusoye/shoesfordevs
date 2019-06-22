import React from 'react';
import {Mutation} from 'react-apollo'
import gql from 'graphql-tag';
import {CURRENT_USER_QUERY} from './User';
import styled from 'styled-components';

const SIGN_OUT_MUTATION = gql`
    mutation SIGN_OUT_MUTATION {
        signout {
            message
        }
    }
`;

const SignoutButton = styled.button`
    color: palevioletred;
`;

const SignOut = (props) => (
    <Mutation mutation={SIGN_OUT_MUTATION} refetchQueries={[
        {query: CURRENT_USER_QUERY}
    ]}>
        {(signout) => {
            return (
                <SignoutButton onClick={signout}>Sign Out</SignoutButton>
            )
        }}
        
    </Mutation>
)

export default SignOut;