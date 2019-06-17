import SingleItem from '../components/SingleItem';

const Product = props => (
    <div>
        <SingleItem id={props.query.id} />
    </div>
);

export default Product;