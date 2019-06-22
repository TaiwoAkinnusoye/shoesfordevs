import NavStyles from './styles/NavStyles';
import User from './User';
import SignOut from './Signout';

import Link from 'next/link';
const Nav = () => (
    
        <User>
            {({data: {currentUser}}) => (
              <NavStyles> 
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