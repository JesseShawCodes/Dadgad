"use client"
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import myImage from './logo.png';

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between flex-wrap bg-gray-800 p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <Image src={myImage} alt="Dadgad logo" role="presentation" className="mr-2" style={{width: '30px', height: 'auto'}}/>
        <Link href="/" className="font-semibold text-xl tracking-tight">{process.env.NEXT_PUBLIC_NAME}</Link>
      </div>
      <div className="block lg:hidden">
        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center px-3 py-2 border rounded text-teal-200 border-teal-400 hover:text-white hover:border-white">
          <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/></svg>
        </button>
      </div>
      <div className={`${isOpen ? 'block' : 'hidden'} w-full flex-grow lg:flex lg:items-center lg:w-auto`}>
        <div className="text-sm lg:flex-grow">
          <Link href="/about" className="block mt-4 lg:inline-block lg:mt-0 text-gray-300 hover:text-white mr-4 transition-colors duration-300">
            About
          </Link>
          <Link href="/search" className="block mt-4 lg:inline-block lg:mt-0 text-gray-300 hover:text-white transition-colors duration-300">
            Search
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
