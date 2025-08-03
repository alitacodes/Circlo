import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Search, Plus, User, LogOut, Settings, Sparkles, Home, ShoppingCart, MessageCircle } from 'lucide-react';
import { Menu as HeadlessMenu } from '@headlessui/react';
import logo from '../assets/circlo-logo.png';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Browse', href: '/listings', icon: Search },
    { name: 'Cultural Vault', href: '/cultural-vault', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg">
    
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src={logo} 
                alt="Circlo Logo" 
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="text-xl font-semibold text-gray-900">
                Circlo
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-white/60 text-blue-700 border border-white/40 shadow-md backdrop-blur-sm'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-white/40 hover:backdrop-blur-sm hover:shadow-md'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Admin button, only for admin@circlo.com */}
              {user && user.email === 'admin@circlo.com' && (
                <Link
                  to="/admin"
                  className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-white/40 border border-red-200/50 backdrop-blur-sm shadow-md transition-all duration-300"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {/* Cart icon - always visible */}
            <Link
              to="/cart"
              className="p-2 text-gray-600 hover:text-gray-900 transition-all duration-300 relative rounded-lg hover:bg-white/40 hover:backdrop-blur-sm hover:shadow-md"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {/* Cart item count badge */}
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                0
              </span>
            </Link>

            {user ? (
              <>
                <Link
                  to="/add-listing"
                  className="hidden sm:flex items-center space-x-2 bg-blue-600/90 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="w-4 h-4" />
                  <span>List Item</span>
                </Link>

                {/* User Menu */}
                <HeadlessMenu as="div" className="relative">
                  <HeadlessMenu.Button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/40 hover:backdrop-blur-sm hover:shadow-md transition-all duration-300">
                    <img
                      src={user.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                    />
                    <span className="hidden sm:block text-sm font-medium text-gray-900">{user.name}</span>
                  </HeadlessMenu.Button>
                  
                  <HeadlessMenu.Items className="absolute right-0 mt-2 w-48 bg-white/80 backdrop-blur-md rounded-lg shadow-xl border border-white/20 focus:outline-none z-50">
                    <div className="py-1">
                      <HeadlessMenu.Item>
                        {({ active }) => (
                          <Link
                            to="/dashboard"
                            className={`flex items-center space-x-2 px-4 py-2 text-sm ${
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                            }`}
                          >
                            <User className="w-4 h-4" />
                            <span>Dashboard</span>
                          </Link>
                        )}
                      </HeadlessMenu.Item>
                      <HeadlessMenu.Item>
                        {({ active }) => (
                          <Link
                            to="/chat-hub"
                            className={`flex items-center space-x-2 px-4 py-2 text-sm ${
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                            }`}
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Chat Hub</span>
                          </Link>
                        )}
                      </HeadlessMenu.Item>
                      <HeadlessMenu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`w-full flex items-center space-x-2 px-4 py-2 text-sm ${
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                            }`}
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign out</span>
                          </button>
                        )}
                      </HeadlessMenu.Item>
                    </div>
                  </HeadlessMenu.Items>
                </HeadlessMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/40 hover:backdrop-blur-sm hover:shadow-md transition-all duration-300"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600/90 text-white px-4 py-2 rounded-lg hover:bg-blue-700/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-medium"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white/40 hover:backdrop-blur-sm hover:shadow-md transition-all duration-300"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-white/80 backdrop-blur-md">
            <div className="px-4 py-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 text-base font-medium rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-white/60 text-blue-700 border-l-4 border-blue-700 backdrop-blur-sm shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/40 hover:backdrop-blur-sm hover:shadow-md'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
                
              {/* Cart - always visible */}
              <Link
                to="/cart"
                className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-white/40 hover:backdrop-blur-sm hover:shadow-md rounded-lg transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5 flex-shrink-0" />
                <span>Cart</span>
              </Link>
                
              {user && (
                <Link
                  to="/add-listing"
                  className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-white/40 hover:backdrop-blur-sm hover:shadow-md rounded-lg transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Plus className="w-5 h-5 flex-shrink-0" />
                  <span>List Item</span>
                </Link>
              )}
                
              {/* Admin button, only for admin@circlo.com */}
              {user && user.email === 'admin@circlo.com' && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-white/40 hover:backdrop-blur-sm hover:shadow-md rounded-lg transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;