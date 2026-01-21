import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { Sparkles, Store, Calendar, TrendingUp, Star, Zap, Heart, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* Hero Section - Stunning with Animated Gradient Mesh */}
      <div className="relative gradient-mesh min-h-screen flex items-center">
        {/* Floating animated elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-purple/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-brand-pink/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="flex flex-col items-center justify-center text-center">
            {/* Glassmorphism Hero Card */}
            <div className="glass-card max-w-5xl w-full p-8 md:p-16 animate-fade-in">
              {/* Logo/Brand */}
              <div className="mb-8">
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 animate-slide-up">
                  <span className="text-gradient-sunset bg-clip-text text-transparent">BeautyTryOn</span>
                </h1>
                <p className="text-2xl md:text-4xl text-gray-800 font-light animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  Virtual Hair & Nail Try-On Marketplace
                </p>
              </div>

              {/* Value Proposition */}
              <div className="max-w-3xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
                  Discover styles from top salons, try them on virtually with AR, and book appointments instantly.
                  <span className="text-gradient-sunset bg-clip-text text-transparent font-semibold"> The future of beauty is here.</span>
                </p>

                {/* Feature badges with glass effect */}
                <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
                  <div className="glass-strong px-6 py-3 rounded-full flex items-center gap-2 hover-lift">
                    <Sparkles className="w-5 h-5 text-brand-purple animate-pulse" />
                    <span className="font-medium">Real-time AR</span>
                  </div>
                  <div className="glass-strong px-6 py-3 rounded-full flex items-center gap-2 hover-lift">
                    <Store className="w-5 h-5 text-brand-pink" />
                    <span className="font-medium">500+ Salons</span>
                  </div>
                  <div className="glass-strong px-6 py-3 rounded-full flex items-center gap-2 hover-lift">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="font-medium">1000+ Styles</span>
                  </div>
                  <div className="glass-strong px-6 py-3 rounded-full flex items-center gap-2 hover-lift">
                    <Calendar className="w-5 h-5 text-brand-purple" />
                    <span className="font-medium">Instant Booking</span>
                  </div>
                </div>
              </div>

              {/* CTA Buttons - Premium variants */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <Link
                  href="/stores"
                  className="group relative px-10 py-5 bg-gradient-to-r from-brand-purple via-brand-pink to-purple-600 text-white rounded-full font-bold text-lg shadow-brand hover:shadow-brand-hover transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                >
                  <span className="relative z-10">Browse Salons</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-brand-purple rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link
                  href="/dashboard"
                  className="px-10 py-5 glass-strong text-gray-800 rounded-full font-bold text-lg shadow-extra hover:shadow-brand transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border-2 border-white/40 hover:border-brand-purple/60"
                >
                  Try Styles Now
                </Link>
              </div>

              {/* Trust indicator */}
              <p className="text-sm text-gray-600 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <span className="inline-flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  Trusted by 50,000+ beauty enthusiasts
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Premium with Interactive Cards */}
      <div className="relative py-24 bg-gradient-to-b from-white via-purple-50/30 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="text-gradient-sunset bg-clip-text text-transparent">Why Choose BeautyTryOn?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the perfect blend of cutting-edge technology and beauty expertise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* For Customers - Interactive Card */}
            <div className="card-interactive group animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-brand transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Sparkles className="w-10 h-10 text-white animate-pulse" />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-purple-400 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">Try Virtually</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Use cutting-edge AR technology to try on hair and nail styles from hundreds of salons before booking.
                See yourself in your new look instantly.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-brand-purple font-bold hover:gap-4 transition-all group"
              >
                Start Trying
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            {/* For Salons - Glass Card */}
            <div className="card-glass group animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-brand transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Store className="w-10 h-10 text-white" />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-pink-400 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">List Your Salon</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Showcase your stunning styles to thousands of potential customers and accept bookings seamlessly.
                Grow your business with us.
              </p>
              <Link
                href="/dashboard/store/create"
                className="inline-flex items-center gap-2 text-brand-pink font-bold hover:gap-4 transition-all group"
              >
                Get Started
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            {/* Book Instantly - Gradient Card */}
            <div className="card-gradient group animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-brand transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Calendar className="w-10 h-10 text-white" />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-green-400 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">Book Instantly</h3>
              <p className="text-white/90 mb-6 leading-relaxed">
                Found your perfect style? Book an appointment with the salon in seconds.
                No hassle, no waiting, just beauty.
              </p>
              <Link
                href="/stores"
                className="inline-flex items-center gap-2 text-white font-bold hover:gap-4 transition-all group"
              >
                Browse Salons
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>

          {/* Additional Features Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
            <div className="glass-card p-6 text-center hover-lift animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h4 className="font-bold text-lg mb-2">Lightning Fast</h4>
              <p className="text-sm text-gray-600">Instant AR preview with no lag</p>
            </div>
            <div className="glass-card p-6 text-center hover-lift animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h4 className="font-bold text-lg mb-2">Save Favorites</h4>
              <p className="text-sm text-gray-600">Build your style wishlist</p>
            </div>
            <div className="glass-card p-6 text-center hover-lift animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h4 className="font-bold text-lg mb-2">Secure Booking</h4>
              <p className="text-sm text-gray-600">Protected payments & privacy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof - Stunning Stats with Glass Effect */}
      <div className="relative py-20 gradient-sunset">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white animate-fade-in">
            Trusted by Leading Salons
          </h2>
          <p className="text-center text-white/90 mb-16 text-lg animate-fade-in">
            Join the beauty revolution that's transforming the industry
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto">
            <div className="glass-strong p-8 rounded-3xl text-center hover-lift group animate-slide-up shadow-brand" style={{ animationDelay: '0.1s' }}>
              <div className="text-5xl md:text-6xl font-bold text-white mb-3 group-hover:scale-110 transition-transform">
                500+
              </div>
              <div className="text-white/90 font-medium">Partner Salons</div>
              <div className="mt-4 h-1 w-16 bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto"></div>
            </div>

            <div className="glass-strong p-8 rounded-3xl text-center hover-lift group animate-slide-up shadow-brand" style={{ animationDelay: '0.2s' }}>
              <div className="text-5xl md:text-6xl font-bold text-white mb-3 group-hover:scale-110 transition-transform">
                10k+
              </div>
              <div className="text-white/90 font-medium">Monthly Bookings</div>
              <div className="mt-4 h-1 w-16 bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto"></div>
            </div>

            <div className="glass-strong p-8 rounded-3xl text-center hover-lift group animate-slide-up shadow-brand" style={{ animationDelay: '0.3s' }}>
              <div className="text-5xl md:text-6xl font-bold text-white mb-3 flex items-center justify-center gap-2 group-hover:scale-110 transition-transform">
                <Star className="w-10 h-10 md:w-12 md:h-12 fill-current text-yellow-400 animate-pulse" />
                4.9
              </div>
              <div className="text-white/90 font-medium">Average Rating</div>
              <div className="mt-4 h-1 w-16 bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto"></div>
            </div>

            <div className="glass-strong p-8 rounded-3xl text-center hover-lift group animate-slide-up shadow-brand" style={{ animationDelay: '0.4s' }}>
              <div className="text-5xl md:text-6xl font-bold text-white mb-3 group-hover:scale-110 transition-transform">
                50k+
              </div>
              <div className="text-white/90 font-medium">Happy Customers</div>
              <div className="mt-4 h-1 w-16 bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto"></div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works - Timeline Design with Animations */}
      <div className="relative py-24 bg-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-20 left-10 w-64 h-64 bg-purple-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-pink-200 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="text-gradient-sunset bg-clip-text text-transparent">How It Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get your perfect look in three simple steps
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Timeline container */}
            <div className="relative">
              {/* Connecting line - hidden on mobile, visible on desktop */}
              <div className="hidden md:block absolute top-32 left-0 right-0 h-1 bg-gradient-to-r from-brand-purple via-brand-pink to-green-500 opacity-30"></div>

              <div className="grid md:grid-cols-3 gap-12 md:gap-8">
                {/* Step 1 */}
                <div className="relative animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <div className="card-elevated group hover:shadow-brand transition-all duration-500">
                    {/* Step number with gradient */}
                    <div className="relative mb-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl flex items-center justify-center text-4xl font-bold mx-auto shadow-brand transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative z-10">
                        <span className="text-white">1</span>
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-400 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    </div>

                    <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">Browse Styles</h3>
                    <p className="text-gray-600 text-center leading-relaxed">
                      Explore thousands of stunning hair and nail styles from top-rated salons in your area.
                      Filter by trend, color, or occasion.
                    </p>

                    {/* Decorative element */}
                    <div className="mt-6 flex justify-center">
                      <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-transparent rounded-full"></div>
                    </div>
                  </div>

                  {/* Connecting dot for timeline */}
                  <div className="hidden md:block absolute top-32 left-1/2 -translate-x-1/2 w-4 h-4 bg-brand-purple rounded-full shadow-lg ring-4 ring-white"></div>
                </div>

                {/* Step 2 */}
                <div className="relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <div className="card-glass group hover:shadow-brand transition-all duration-500">
                    {/* Step number with gradient */}
                    <div className="relative mb-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-pink-700 rounded-3xl flex items-center justify-center text-4xl font-bold mx-auto shadow-brand transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative z-10">
                        <span className="text-white">2</span>
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-pink-400 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    </div>

                    <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">Try On Virtually</h3>
                    <p className="text-gray-600 text-center leading-relaxed">
                      Use our cutting-edge AR technology to see how each style looks on you in real-time.
                      Perfect fit, every time.
                    </p>

                    {/* Decorative element */}
                    <div className="mt-6 flex justify-center">
                      <div className="w-12 h-1 bg-gradient-to-r from-pink-500 to-transparent rounded-full"></div>
                    </div>
                  </div>

                  {/* Connecting dot for timeline */}
                  <div className="hidden md:block absolute top-32 left-1/2 -translate-x-1/2 w-4 h-4 bg-brand-pink rounded-full shadow-lg ring-4 ring-white"></div>
                </div>

                {/* Step 3 */}
                <div className="relative animate-slide-up" style={{ animationDelay: '0.3s' }}>
                  <div className="card-interactive group hover:shadow-brand transition-all duration-500">
                    {/* Step number with gradient */}
                    <div className="relative mb-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-700 rounded-3xl flex items-center justify-center text-4xl font-bold mx-auto shadow-brand transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative z-10">
                        <span className="text-white">3</span>
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-green-400 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    </div>

                    <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">Book & Go</h3>
                    <p className="text-gray-600 text-center leading-relaxed">
                      Love what you see? Book your appointment instantly and get your stunning new look.
                      It's that simple!
                    </p>

                    {/* Decorative element */}
                    <div className="mt-6 flex justify-center">
                      <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-transparent rounded-full"></div>
                    </div>
                  </div>

                  {/* Connecting dot for timeline */}
                  <div className="hidden md:block absolute top-32 left-1/2 -translate-x-1/2 w-4 h-4 bg-green-600 rounded-full shadow-lg ring-4 ring-white"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link
              href="/stores"
              className="inline-block px-12 py-5 bg-gradient-to-r from-brand-purple via-brand-pink to-purple-600 text-white rounded-full font-bold text-lg shadow-brand hover:shadow-brand-hover transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              Start Your Beauty Journey
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom CTA - Irresistible with Full-width Gradient */}
      <div className="relative gradient-mesh py-24 overflow-hidden">
        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-20 w-96 h-96 bg-brand-purple/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-brand-pink/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Glassmorphism overlay card */}
          <div className="glass-strong max-w-5xl mx-auto p-12 md:p-16 rounded-3xl text-center shadow-extra">
            <div className="animate-fade-in">
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-gray-900">
                Ready to Transform Your Look?
              </h2>
              <p className="text-xl md:text-2xl mb-10 text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Join <span className="text-gradient-sunset bg-clip-text text-transparent font-bold">50,000+ beauty enthusiasts</span> discovering their perfect style with BeautyTryOn.
              </p>

              {/* Feature highlights */}
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <div className="glass-card px-6 py-3 rounded-full">
                  <span className="font-semibold">Free to use</span>
                </div>
                <div className="glass-card px-6 py-3 rounded-full">
                  <span className="font-semibold">No credit card required</span>
                </div>
                <div className="glass-card px-6 py-3 rounded-full">
                  <span className="font-semibold">Instant access</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up">
                <Link
                  href="/stores"
                  className="group relative px-12 py-6 bg-gradient-to-r from-brand-purple via-brand-pink to-purple-600 text-white rounded-full font-bold text-xl shadow-brand hover:shadow-brand-hover transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Browse Salons
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-brand-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>

                <Link
                  href="/dashboard/store/create"
                  className="px-12 py-6 glass-strong text-gray-800 rounded-full font-bold text-xl shadow-extra hover:shadow-brand transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 border-2 border-white/50 hover:border-brand-purple/80"
                >
                  List Your Salon
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Secure & Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium">Loved by 50k+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
