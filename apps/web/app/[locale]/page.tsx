import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { Sparkles, Store, Calendar, TrendingUp, Star } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
            {/* Logo/Brand */}
            <div className="mb-8 animate-fade-in">
              <h1 className="text-6xl md:text-8xl font-bold mb-4">
                <span className="text-gradient">BeautyTryOn</span>
              </h1>
              <p className="text-2xl md:text-3xl text-gray-600 font-light">
                Virtual Hair & Nail Try-On Marketplace
              </p>
            </div>

            {/* Value Proposition */}
            <div className="max-w-3xl mb-12 animate-slide-up">
              <p className="text-xl md:text-2xl text-gray-700 mb-6">
                Discover styles from top salons, try them on virtually with AR, and book appointments instantly.
                The future of beauty is here.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm md:text-base text-gray-600">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-purple" />
                  Real-time AR
                </div>
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-brand-pink" />
                  500+ Salons
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  1000+ Styles
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-brand-purple" />
                  Instant Booking
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link
                href="/stores"
                className="px-8 py-4 bg-gradient-brand text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Browse Salons
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-white text-gray-800 rounded-full font-semibold text-lg shadow-md hover:shadow-lg transition-all border-2 border-gray-200 hover:border-brand-purple"
              >
                Try Styles Now
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-12">
              {/* For Customers */}
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-800">Try Virtually</h3>
                <p className="text-gray-600">
                  Use AR to try on hair and nail styles from hundreds of salons before booking.
                </p>
                <Link href="/dashboard" className="text-brand-purple font-semibold mt-4 inline-block hover:underline">
                  Start Trying →
                </Link>
              </div>

              {/* For Salons */}
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-800">List Your Salon</h3>
                <p className="text-gray-600">
                  Showcase your styles and accept bookings from thousands of customers.
                </p>
                <Link href="/dashboard/store/create" className="text-brand-pink font-semibold mt-4 inline-block hover:underline">
                  Get Started →
                </Link>
              </div>

              {/* Book Instantly */}
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-800">Book Instantly</h3>
                <p className="text-gray-600">
                  Found your perfect style? Book an appointment with the salon in seconds.
                </p>
                <Link href="/stores" className="text-green-600 font-semibold mt-4 inline-block hover:underline">
                  Browse Salons →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Trusted by Leading Salons
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-purple mb-2">500+</div>
              <div className="text-gray-600">Partner Salons</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-pink mb-2">10k+</div>
              <div className="text-gray-600">Monthly Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-500 mb-2 flex items-center justify-center gap-1">
                <Star className="w-8 h-8 fill-current" />
                4.9
              </div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">50k+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-purple text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Browse Styles</h3>
              <p className="text-gray-600">
                Explore thousands of hair and nail styles from top-rated salons in your area.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-pink text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Try On Virtually</h3>
              <p className="text-gray-600">
                Use our AR technology to see how each style looks on you in real-time.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Book & Go</h3>
              <p className="text-gray-600">
                Love what you see? Book your appointment instantly and get your new look.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Look?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of beauty enthusiasts discovering their perfect style with BeautyTryOn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/stores"
              className="px-8 py-4 bg-white text-purple-600 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Browse Salons
            </Link>
            <Link
              href="/dashboard/store/create"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-purple-600 transition-all"
            >
              List Your Salon
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
