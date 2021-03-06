import {Mutation} from 'react-apollo';
import {TOGGLE_CART_MUTATION} from './Cart';
import NavStyles from './styles/NavStyles';
import User from './User';
import SignOut from './Signout';
import CartCount from './CartCount';

import Link from 'next/link';
const Nav = () => (
    
        <User>
            {({data: {currentUser}}) => (
              <NavStyles data-test="nav"> 
                  <Link href="/products">
                        <a>Shop</a>
                    </Link>
                    {currentUser && (
                    <>
                    <Link href="/sell">
                        <a>Sell</a>
                    </Link>
                    <Link href="/orders">
                        <a>Orders</a>
                    </Link>
                    <Link href="/me">
                        <a>Account</a>
                    </Link>
                    <SignOut />
                    <Mutation mutation={TOGGLE_CART_MUTATION}>
                        {(toggleCart) => (
                            <button onClick={toggleCart}>Cart
                            <CartCount count={currentUser.cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0)} />
                            </button>
                        )}
                    </Mutation>
                    
                    </> 
                    )}
                    {!currentUser && (
                        <Link href="/signup">
                        <a>Sign In</a>
                        </Link> 
            )}

                </NavStyles> 
            )}
        </User>
        
);

export default Nav;