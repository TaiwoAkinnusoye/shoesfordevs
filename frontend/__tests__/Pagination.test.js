import {mount} from 'enzyme';
import wait from 'waait';
import toJSON from 'enzyme-to-json';
import Pagination, {PAGINATION_QUERY} from '../components/Pagination';
import {MockedProvider} from 'react-apollo/test-utils';

const makeMocksFor = (length) => {
    return [
        {
            request: {query: PAGINATION_QUERY},
            result: {
                data: {
                    itemsConnection: {
                        __typename: 'aggregate',
                        aggregate: {
                            __typename: 'count',
                                count: {length}
                            }
                }
            }
        }
    }
    ]
}

describe('<Pagination />', () => {
    it('displays a loading message', () => {
        const wrapper = mount(
            <MockedProvider mocks={makeMocksFor(1)}>
                <Pagination page={1} />
            </MockedProvider>
        );
        })
})