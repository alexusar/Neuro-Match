import { useNavigate } from "react-router-dom";
import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import { useEffect } from 'react';
import logo from '../assets/logo.png';
import { FaTwitter, FaYoutube, FaInstagram } from 'react-icons/fa';

const images = [
  {
    src: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?auto=format&fit=crop&w=800&q=80',
    title: 'Find love naturally',
  },
  {
    src: 'https://images.unsplash.com/photo-1559494007-9f5847c49d94?auto=format&fit=crop&w=800&q=80',
    title: 'Where science meets connection',
  },
  {
    src: 'https://images.unsplash.com/photo-1565128537362-b3a962ece546?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzF8fGdheXxlbnwwfHwwfHx8MA%3D%3D',
    title: 'AI-powered compatibility',
  },
  {
    src: 'https://images.unsplash.com/photo-1624979629432-f99553c39da1?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGdidHF8ZW58MHx8MHx8fDA%3D',
    title: 'Your journey to meaningful relationships',
  },
  {
    src: 'https://images.unsplash.com/photo-1464475118943-37d9341563f3?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    title: 'Discover your perfect match',
  },
  {
    src: 'https://images.unsplash.com/photo-1565713729916-f07da60b7a82?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDZ8fGxnYnRxfGVufDB8fDB8fHww',
    title: 'Connect with like-minded individuals',
  },
  {
    src: 'https://images.unsplash.com/photo-1588456024141-172c0f2d2dd8?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTl8fHRyYW5zfGVufDB8MHwwfHx8Mg%3D%3D',
    title: 'Experience love in a new way',
  },
];

function HomeUI() {
  const navigate = useNavigate();
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slideChanged: () => {},
  });

  // Autoplay effect
  useEffect(() => {
    const interval = setInterval(() => {
      instanceRef.current?.next();
    }, 3000); // Change slide every 3 seconds
    return () => clearInterval(interval);
  }, [instanceRef]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-700 to-blue-400 text-white">
      
      {/* Top Navigation */}
      <div className="flex justify-between items-center px-6 py-4 bg-white rounded-full">
        
        {/* Logo */}
        <img
          src={logo}
          alt="NeuroMatch Logo"
          className="h-20 w-auto"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate("/")}
        />

        {/* Center title */}
        <div className="flex-center text-5xl bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text font-bold">
          <h1> NeuroMatch</h1>
        </div>

        {/* Move to the right, login and signup buttons */}
        <div className="flex space-x-4 text-2xl">
          <button
            onClick={() => navigate("/login")}
            className="bg-white text-blue-600 font-semibold px-4 py-2 rounded mr-4 hover:bg-gray-100"
          >
            Log In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-white text-purple-600 font-semibold px-4 py-2 rounded hover:bg-gray-100"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center py-20 px-6">
        <h1 className="text-5xl font-bold mb-4">Welcome to NeuroMatch</h1>
        <p className="max-w-2xl text-lg">
          Where AI meets meaningful connections. NeuroMatch helps you find genuine relationships by understanding who you are.
        </p>
      </div>

      {/* About Us */}
      <div className="px-6 md:px-20 py-8">
        <div className="bg-white text-gray-900 p-6 rounded-b-4xl shadow-md">
          <h2 className="text-2xl font-bold mb-2">About Us</h2>
          <p>
            NeuroMatch is an innovative dating platform that uses cutting-edge AI to create deep and meaningful matches. Our mission is to prioritize emotional compatibility and safety in the online dating world.
          </p>
        </div>
      </div>

      {/* Image Carousel Section */}
      <div className="bg-gradient-to-b from-blue-500 to-purple-500 w-full py-12 mt-[-2rem]">
        <div className="px-6 md:px-20 mb-8 relative max-w-4xl mx-auto">
          <div
            ref={sliderRef}
            className="keen-slider rounded-lg overflow-hidden"
          >
            {images.map((item, i) => (
              <div
                key={i}
                className="keen-slider__slide relative"
              >
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-[24rem] object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-center py-2">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Arrow Buttons on top of images */}
          <button
            onClick={() => instanceRef.current?.prev()}
            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 text-purple-600 px-3 py-1 rounded-full shadow hover:bg-white z-10"
          >
            ◀
          </button>
          <button
            onClick={() => instanceRef.current?.next()}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 text-purple-600 px-3 py-1 rounded-full shadow hover:bg-white z-10"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Subscriptions and Safety Tips Side-by-Side */}
      <div className="w-full bg-gradient-to-b from-purple-500 to-purple-600 py-12 mt-[-2rem]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 md:px-20">
          {/* Subscriptions */}
          <div className="bg-white text-gray-900 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-2">Subscription Plans</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>💙 Free Tier – Basic matches, messaging, and one AI Super Match</li>
              <li>💎 Premium – Rizz Bot</li>
              <li>🚀 Platinum – Priority visibility and AI-assisted date planning</li>
            </ul>
          </div>

          {/* Safety Tips */}
          <div className="bg-white text-gray-900 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-2">🛡️ Dating Safety Tips</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Always meet in public places for first dates.</li>
              <li>Don’t share financial info or passwords.</li>
              <li>Trust your instincts – if something feels off, it probably is.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
     <footer className="bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200 px-6 py-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Company */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Company</h3>
            <ul className="space-y-1 text-sm">
              <li><a href="#" className="hover:text-purple-600">About Us</a></li>
              <li><a href="#" className="hover:text-purple-600">Blog</a></li>
              <li><a href="#" className="hover:text-purple-600">Careers</a></li>
              <li><a href="#" className="hover:text-purple-600">Contact Us</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Support</h3>
            <ul className="space-y-1 text-sm">
              <li><a href="#" className="hover:text-purple-600">Help Center</a></li>
              <li><a href="#" className="hover:text-purple-600">Safety Center</a></li>
              <li><a href="#" className="hover:text-purple-600">Community Guidelines</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Legal</h3>
            <ul className="space-y-1 text-sm">
              <li><a href="#" className="hover:text-purple-600">Cookies Policy</a></li>
              <li><a href="#" className="hover:text-purple-600">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-purple-600">Terms of Service</a></li>
              <li><a href="#" className="hover:text-purple-600">Law Enforcement</a></li>
            </ul>
          </div>

          {/* App Downloads */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Install App</h3>
            <div className="space-y-2">
              <img src="https://via.placeholder.com/150x50?text=App+Store" alt="App Store" className="w-36" />
              <img src="https://via.placeholder.com/150x50?text=Google+Play" alt="Google Play" className="w-36" />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-10 border-t pt-6 border-gray-300 text-sm">
          <p>© {new Date().getFullYear()} NeuroMatch. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-purple-600"><FaTwitter size={20} /></a>
            <a href="#" className="hover:text-purple-600"><FaYoutube size={20} /></a>
            <a href="#" className="hover:text-purple-600"><FaInstagram size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomeUI;
