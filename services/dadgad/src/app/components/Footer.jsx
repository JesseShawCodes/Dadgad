import { React } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInstagram, faLinkedin, faXTwitter,
} from '@fortawesome/free-brands-svg-icons';

function Footer() {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800">
      <footer className="container mx-auto py-3 my-4" role="contentinfo">
        <div className="flex items-center justify-between w-full">
          <div className="mb-3 md:mb-0 text-sm text-slate-600 dark:text-slate-300">
            © 2025 {process.env.NEXT_PUBLIC_NAME}
          </div>
          <ul className="flex md:w-1/3 list-none gap-3">
            <li>
              <a
                className="text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
                href="#"
                title="Instagram"
              >
                <FontAwesomeIcon icon={faInstagram} />
              </a>
            </li>
            <li>
              <a
                className="text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
                href="#"
                title="LinkedIn"
              >
                <FontAwesomeIcon icon={faLinkedin} />
              </a>
            </li>
            <li>
              <a
                className="text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
                href="#"
                title="Twitter"
              >
                <FontAwesomeIcon icon={faXTwitter} />
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
