import { ShoppingCart, UserIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '../../ui/button';
import { APP_NAME } from '@/lib/constants';
import logo from '@/public/logo.svg'

const Header = () => {
 return ( <header className='w-full border-b'>
   <div className="wrapper flex-between">
    <div className="flex-start">
     <Link href={`/`} className='flex-start'>
      <Image src={logo} alt='logo' width={40} height={40}/>
     </Link>
     <span className="hidden font-bold text-2xl ml-3">{APP_NAME}</span>
     <Button />
    </div>
   </div>
 </header> );
}
 
export default Header;