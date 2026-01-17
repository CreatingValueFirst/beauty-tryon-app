import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          {/* Logo/Brand */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-6xl md:text-8xl font-bold mb-4">
              <span className="text-gradient">BeautyTryOn</span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-600 font-light">
              Virtual Hair & Nail Try-On
            </p>
          </div>

          {/* Value Proposition */}
          <div className="max-w-3xl mb-12 animate-slide-up">
            <p className="text-xl md:text-2xl text-gray-700 mb-6">
              Transform your look instantly with AI-powered virtual try-on technology.
              Try thousands of hairstyles and nail designs before you commit.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-purple" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Real-time AR
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-pink" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                1000+ Styles
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-purple" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                AI-Powered
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-gradient-brand text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Try It Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-gray-800 rounded-full font-semibold text-lg shadow-md hover:shadow-lg transition-all border-2 border-gray-200 hover:border-brand-purple"
            >
              Sign In
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full mt-12">
            {/* Hair Try-On */}
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-800">Hair Styles</h3>
              <p className="text-gray-600">
                Try on thousands of hairstyles, colors, and textures. From short bobs to long waves, find your perfect look.
              </p>
            </div>

            {/* Nail Try-On */}
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-800">Nail Designs</h3>
              <p className="text-gray-600">
                Experiment with nail polishes, patterns, and art designs. See how they look on your hands in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2026 BeautyTryOn. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
