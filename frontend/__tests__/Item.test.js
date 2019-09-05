import Item from "../components/Item";
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';

const fakeItem = {
    id: 'ABC123',
    title: 'A Cool Item',
    description: 'A very very cool item',
    price: 12000,
    image: 'dog.jpg',
    largeImage: 'largeDog.jpg'
};

describe('<Item />', () => {
    // it('renders the item image properly', () => {
    //     const wrapper = shallow(<Item item={fakeItem} />);
    //     const img = wrapper.find('img');
    //     expect(img.props().src).toBe(fakeItem.image)
    //     expect(img.props().alt).toBe(fakeItem.title)
    // });
    // it('renders the price tag and title properly', () => {
    //     const wrapper = shallow(<Item item={fakeItem} />);
    //     const PriceTag = wrapper.find('PriceTag');
    //     expect(PriceTag.children().text()).toBe('$120');
    //     expect(wrapper.find('Title a').text()).toBe(fakeItem.title);
    // });
    // it('renders out the buttons properly', () => {
    //     const wrapper = shallow(<Item item={fakeItem} />);
    //     const buttonList = wrapper.find('.buttonList');
    //     expect(buttonList.children()).toHaveLength(3);
    //     expect(buttonList.find('Link').exists()).toBe(true);
    //     expect(buttonList.find('AddToCart').exists()).toBe(true)
    //     expect(buttonList.find('DeleteItem').exists()).toBe(true)
    // })

    it('renders and matches the snapshot', () => {
        const wrapper = shallow(<Item item={fakeItem} />);
        expect(toJSON(wrapper)).toMatchSnapshot();
    })
});