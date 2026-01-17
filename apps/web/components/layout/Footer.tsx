import Link from 'next/link';
import { Sparkles, Instagram, Twitter, Facebook, Youtube, Mail } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-brand-purple" />
              <span className="text-xl font-bold text-white">BeautyTryOn</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Virtual try-on platform for hair and nails. Discover styles from top salons and book your perfect look.
            </p>
            <div className="flex gap-3">
              <a href="#" className="hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* For Customers */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Customers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard/hair" className="hover:text-white transition-colors">
                  Hair Try-On
                </Link>
              </li>
              <li>
                <Link href="/dashboard/nails" className="hover:text-white transition-colors">
                  Nail Try-On
                </Link>
              </li>
              <li>
                <Link href="/stores" className="hover:text-white transition-colors">
                  Browse Salons
                </Link>
              </li>
              <li>
                <Link href="/dashboard/gallery" className="hover:text-white transition-colors">
                  My Gallery
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* For Salons */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Salons</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard/store" className="hover:text-white transition-colors">
                  Store Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/store/create" className="hover:text-white transition-colors">
                  List Your Salon
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="hover:text-white transition-colors">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/refunds" className="hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="max-w-md">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Stay Updated
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Get the latest styles, tips, and exclusive offers delivered to your inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple"
              />
              <button className="px-6 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-md font-medium transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-400">
            © {currentYear} BeautyTryOn by{' '}
            <a href="#" className="text-brand-purple hover:text-brand-purple/80 transition-colors">
              Save My Time
            </a>
            . All rights reserved.
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/legal/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/legal/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/legal/refunds" className="hover:text-white transition-colors">
              Refunds
            </Link>
            <Link href="/sitemap.xml" className="hover:text-white transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
