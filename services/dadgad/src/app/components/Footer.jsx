import { React } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInstagram, faLinkedin, faXTwitter,
} from '@fortawesome/free-brands-svg-icons';

function Footer() {
  return (
    <div className="bg-my-gradient-footer">
      <footer className="container mx-auto py-3 my-4" role="contentinfo">
        <div className="flex items-center justify-between w-full">
          <div className="mb-3 md:mb-0">© 2025 {process.env.NEXT_PUBLIC_NAME}</div>
          <ul className="flex md:w-1/3 list-none">
            <li className="ml-3"><a className="text-gray-500" href="#" title="Instagram"><FontAwesomeIcon icon={faInstagram} /></a></li>
            <li className="ml-3"><a className="text-gray-500" href="#" title="LinkedIn"><FontAwesomeIcon icon={faLinkedin} /></a></li>
            <li className="ml-3"><a className="text-gray-500" href="#" title="Twitter"><FontAwesomeIcon icon={faXTwitter} /></a></li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
