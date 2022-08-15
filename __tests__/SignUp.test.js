import {mount} from 'enzyme';
import wait from 'waait';
import toJSON from 'enzyme-to-json';
import {MockedProvider} from 'react-apollo/test-utils';
import SignUp, { SIGNUP_MUTATION } from '../components/Signup';
import {CURRENT_USER_QUERY} from '../components/User';
import {fakeUser} from '../lib/testUtils';
import { ApolloConsumer } from 'react-apollo';

function type(wrapper, name, value) {
    wrapper.find(`input[name="${name}"]`).simulate('change', {
        target: {name, value},
    })
}
const currentUser = fakeUser();
const mocks = [
    // signup mock mutation
    {
        request: {
            query: SIGNUP_MUTATION,
            variables: {
                email: currentUser.email,
                name: currentUser.name,
                password: 'password'
            }
        },
        result: {
            data: {
                signup: {
                    __typename: 'User',
                    id: 'abc123',
                    email: currentUser.email,
                    name: currentUser.name
                }
            }
        }
    },
    // current user query mock
    {
        request: {
            query: CURRENT_USER_QUERY
        },
        result: {
            data: {
                currentUser
            }
        }
    }
];

describe('<SignUp />', () => {
    it('renders and matches snapshot', async () => {
        const wrapper = mount(
            <MockedProvider>
                <SignUp />
            </MockedProvider>
        );
        expect(toJSON(wrapper.find('form'))).toMatchSnapshot();
    });

    it('calls the mutation properly', async () => {
        let apolloClient;
        const wrapper = mount(
            <MockedProvider mocks={mocks}>
                <ApolloConsumer>
                    {client => {
                        apolloClient = client;
                        return <SignUp />;
                    }}
                </ApolloConsumer>
            </MockedProvider>
        );
        await wait();
        wrapper.update();
        type(wrapper, 'name', currentUser.name);
        type(wrapper, 'email', currentUser.email);
        type(wrapper, 'password', 'password');
        wrapper.update();
        wrapper.find('form').simulate('submit');
        await wait();
        // query the user out of the apollo client
        const user = await apolloClient.query({query: CURRENT_USER_QUERY});
        
        expect(user.data.currentUser).toMatchObject(currentUser)
    })
})
