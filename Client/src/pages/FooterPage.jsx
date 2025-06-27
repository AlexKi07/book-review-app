import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

export default function FooterPage() {
  return (
    <footer className="bg-blue-950 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto py-10 px-6 sm:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Logo & Description */}
          <div>
            <h2 className="text-2xl font-bold text-white">ReviewCorner</h2>
            <p className="mt-2 text-sm">
              Discover, review, and discuss your favorite books. Built for readers by readers.
            </p>
            <div className="flex mt-4 space-x-4 text-lg">
              <a href="#" className="hover:text-white"><FaFacebook /></a>
              <a href="#" className="hover:text-white"><FaTwitter /></a>
              <a href="#" className="hover:text-white"><FaInstagram /></a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/books" className="hover:text-white">Browse Books</Link></li>
              <li><Link to="/profile" className="hover:text-white">Your Profile</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white">Contact</h3>
            <p className="mt-3 text-sm">Email: support@reviewcorner.com</p>
            <p className="text-sm">Phone: +254-712-345-678</p>
            <p className="text-sm">Nairobi, Kenya</p>
          </div>
        </div>

        <hr className="my-8 border-gray-600" />

        {/* Bottom bar */}
        <div className="text-center text-xs text-gray-400 space-y-1">
          <p>&copy; {new Date().getFullYear()} ReviewCorner. All rights reserved.</p>
          <a
            href="/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white underline"
          >
            View License
          </a>
        </div>
      </div>
    </footer>
  );
}
