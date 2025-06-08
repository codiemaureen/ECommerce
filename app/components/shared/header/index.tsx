import { ShoppingCart, UserIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../../ui/button';
import { APP_NAME } from '@/lib/constants';
import logo from '@/public/logo.svg'

const Header = () => {
  return ( 
  <header className='w-full border-b'>
    <div className="wrapper flex-between">
      <div className="flex-start">
      <Link href={`/`} className='flex-start'>
        <Image 
          src={logo} 
          alt={`${APP_NAME} logo`} 
          width={40} 
          height={40}/>
        <span className="hidden lg:block font-bold text-2xl ml-3">
          {APP_NAME}
        </span>
      </Link>
      </div>
      <div className="space-x-2">
        <Button asChild variant='ghost'>
          <Link href='/sign-in'>
            <UserIcon /> Sign in
          </Link>
        </Button>
        <Button asChild variant='ghost'>
          <Link href='/sign-in'>
            <ShoppingCart /> Cart
          </Link>
        </Button>
      </div>
    </div>
  </header> );
}

export default Header;