import NavStyles from './styles/NavStyles';

import Link from 'next/link';
const Nav = () => (
    <NavStyles>
        <Link href="/products">
            <a>Shop</a>
        </Link>
        <Link href="/sell">
            <a>Sell</a>
        </Link>
        <Link href="/orders">
            <a>Orders</a>
        </Link>
        <Link href="/me">
            <a>Account</a>
        </Link>
        <Link href="/signup">
            <a>Signup</a>
        </Link>
    </NavStyles>
);

export default Nav;