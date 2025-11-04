
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#364958] text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#C9E4CA]">FindAbode</h3>
            <p className="text-[#C9E4CA]/80 leading-relaxed">
              Your trusted platform to find your dream home. Buy, sell, or rent properties easily.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-[#87BBA2]">Quick Links</h4>
            <ul className="space-y-2 text-[#C9E4CA]/80">
              <li><a href="/listings" className="hover:text-[#87BBA2] transition-colors">Properties</a></li>
              <li><a href="/post-property" className="hover:text-[#87BBA2] transition-colors">Post Property</a></li>
              <li><a href="/about" className="hover:text-[#87BBA2] transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-[#87BBA2] transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-[#87BBA2]">Contact</h4>
            <ul className="space-y-2 text-[#C9E4CA]/80">
              <li>Email: info@findabode.com</li>
              <li>Phone: +91 12345 67890</li>
              <li>Address: Mumbai, India</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4 text-[#87BBA2]">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-[#C9E4CA]/80 hover:text-[#87BBA2] transition-colors transform hover:scale-110">
                <FaFacebook className="text-2xl" />
              </a>
              <a href="#" className="text-[#C9E4CA]/80 hover:text-[#87BBA2] transition-colors transform hover:scale-110">
                <FaTwitter className="text-2xl" />
              </a>
              <a href="#" className="text-[#C9E4CA]/80 hover:text-[#87BBA2] transition-colors transform hover:scale-110">
                <FaInstagram className="text-2xl" />
              </a>
              <a href="#" className="text-[#C9E4CA]/80 hover:text-[#87BBA2] transition-colors transform hover:scale-110">
                <FaLinkedin className="text-2xl" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#55828B]/30 mt-8 pt-6 text-center text-[#C9E4CA]/80">
          <p>&copy; 2025 FindAbode. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;