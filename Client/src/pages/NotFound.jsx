import { Link } from 'react-router-dom';
import { FiHome, FiCompass, FiMeh } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden p-10 text-center">
        {/* Animated Emoji */}
        <div className="text-7xl mb-6 animate-bounce">
          <FiMeh className="inline-block text-yellow-500" />
        </div>
        
        {/* Error Code */}
        <div className="text-8xl font-bold text-indigo-600 mb-2">404</div>
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Lost in the Pages</h1>
        
        {/* Description */}
        <p className="text-gray-600 mb-8 text-lg">
          The page you're looking for has vanished into the digital void. 
          Maybe it's hiding or never existed at all.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/login" 
            className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg 
                      hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <FiHome className="mr-2" />
            Take Me Home
          </Link>
          
          
        </div>
        
        {/* Fun Illustration (using emoji) */}
        <div className="mt-10 text-4xl">
          <span className="inline-block animate-float">📖</span>
          <span className="inline-block animate-float delay-100">🔍</span>
          <span className="inline-block animate-float delay-200">🌌</span>
        </div>
      </div>
    </div>
  );
}