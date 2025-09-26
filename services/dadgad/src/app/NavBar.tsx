"use client"
import Link from 'next/link';
import Image from 'next/image';
import myImage from './logo.png';

function NavBar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark" role="navigation">
      <div className="container">
        <Link href="/" className="nav-link active navbar-brand">
          <Image src={myImage} alt="Dadgad logo" role="presentation" className="me-2" style={{width: '30px', height: 'auto'}}/>
          {process.env.NEXT_PUBLIC_NAME}
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link href="/about" className="nav-link active">About</Link>
            </li>
            <li className="nav-item">
              <Link href="/search" className="nav-link active">Search</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
