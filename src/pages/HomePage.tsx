import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { Search, ArrowRight, Star, Shield, Heart, Users, Eye, Sparkles, Plus, Smartphone, Shirt, Wrench, Car, Baby, Dumbbell, Book, Sofa, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

import {
  GlassCard,
  GlassButton,
  GlassCounter,
  GlassCategoryTile,
  FloatingBadge,
  GlassIcon
} from '../components/GlassComponents';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { listings } = useApp();
  
  // Category scroll functionality
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  // Initialize scroll button states
  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    
    return () => {
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, []);

  const categories = [
    {
      name: 'Electronics',
      shortName: 'Electronics',
      icon: Smartphone,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      count: listings.filter(l => l.category === 'Electronics').length
    },
    {
      name: 'Fashion',
      shortName: 'Fashion',
      icon: Shirt,
      iconBg: 'bg-pink-50',
      iconColor: 'text-pink-600',
      count: listings.filter(l => l.category === 'Fashion').length
    },
    {
      name: 'Tools',
      shortName: 'Tools & Equip',
      icon: Wrench,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      count: listings.filter(l => l.category === 'Tools').length
    },
    {
      name: 'Toys',
      shortName: 'Toys, Baby',
      icon: Baby,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      count: Math.floor(Math.random() * 50) + 10
    },
    {
      name: 'Auto Accessories',
      shortName: 'Auto Access',
      icon: Car,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      count: Math.floor(Math.random() * 30) + 15
    },
    {
      name: 'Sports',
      shortName: 'Sports & Fit',
      icon: Dumbbell,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      count: Math.floor(Math.random() * 40) + 20
    },
    {
      name: 'Books',
      shortName: 'Books & Med',
      icon: Book,
      iconBg: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      count: Math.floor(Math.random() * 60) + 25
    },
    {
      name: 'Furniture',
      shortName: 'Furniture',
      icon: Sofa,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      count: Math.floor(Math.random() * 35) + 12
    },
    {
      name: 'Culture',
      shortName: 'Cultural',
      icon: Sparkles,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      count: listings.filter(l => l.isVaultItem).length
    }
  ];

  const featuredListings = listings.slice(0, 3);

  return (
    <div className="bg-circlo-white font-body min-h-screen">
      {/* Modern Hero Section */}
      <section className="relative bg-gradient-to-br from-circlo-white via-circlo-neutral-100/30 to-circlo-yellow/5 text-circlo-black overflow-hidden min-h-screen">
        {/* Modern Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Geometric Shapes */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
            animate={{ opacity: 0.1, scale: 1, rotate: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute top-1/4 left-1/4 w-64 h-64 border border-circlo-yellow/20 rounded-3xl transform -rotate-12"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 180 }}
            animate={{ opacity: 0.05, scale: 1, rotate: 0 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 border border-circlo-gold/20 rounded-full"
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 0.08, y: 0 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute top-1/2 right-1/3 w-48 h-48 bg-gradient-gold/10 rounded-2xl transform rotate-45 blur-sm"
          />
          
          {/* Animated gradient overlay */}
          <motion.div
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(255,215,0,0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(255,215,0,0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 20%, rgba(255,215,0,0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(255,215,0,0.1) 0%, transparent 50%)'
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-screen flex items-center">
          <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
            {/* Left Content */}
            <div className="space-y-8">


              {/* Main Heading */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-4"
              >
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-black leading-tight">
                  <span className="block text-circlo-black">Rent</span>
                  <span className="block gradient-text">Everything</span>
                  <span className="block text-circlo-black">You Need</span>
                </h1>
                <div className="w-24 h-1 bg-gradient-gold rounded-full"></div>
              </motion.div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-circlo-black/70 leading-relaxed max-w-lg"
              >
                Join the sharing economy. Discover unique items from your community and 
                turn your unused belongings into income.
              </motion.p>



              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-row gap-4"
              >
                <Link to="/listings" className="group">
                  <GlassButton size="lg" className="bg-gradient-gold text-circlo-black font-bold shadow-glass-hover w-full sm:w-auto">
                    <span className="flex items-center">
                    <Search className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Browse Items
                    </span>
                  </GlassButton>
                </Link>
                
                <Link to={user ? "/add-listing" : "/register"} className="group">
                  <GlassButton size="lg" variant="secondary" className="border-circlo-black/20 hover:bg-circlo-black/5 w-full sm:w-auto">
                    {user ? (
                      <span className="flex items-center">
                        <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                        List Item
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <ArrowRight className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                        Join Now
                      </span>
                    )}
                  </GlassButton>
                </Link>
              </motion.div>
            </div>

            {/* Right Visual Elements */}
            <div className="relative">
              {/* Large Payment System Showcase - One Image at a Time */}
              <motion.div
                initial={{ opacity: 0, x: 100, rotateY: -15 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="glass-card p-8 transform perspective-1000 overflow-hidden"
              >
                <div className="relative w-full max-w-4xl mx-auto" style={{ aspectRatio: '16/9' }}>
                  <motion.div
                    animate={{ 
                      scale: [1, 1, 1, 1, 1, 1, 1, 1, 1]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
                  >
                    {/* Image 1 - Your Stuff. Their Need. Your Profit. */}
                    <motion.div
                      animate={{ 
                        opacity: [1, 1, 0, 0, 1],
                        zIndex: [1, 1, 0, 0, 1]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                        times: [0, 0.49, 0.5, 0.99, 1]
                      }}
                      className="absolute inset-0 rounded-3xl overflow-hidden"
                    >
                      <img
                        src="/payment-slide-1.png"
                        alt="Payment System Slide 1"
                        className="w-full h-full object-cover rounded-3xl"
                      />
                    </motion.div>

                    {/* Image 2 - Modern Payment System */}
                      <motion.div
                      animate={{ 
                        opacity: [0, 0, 1, 1, 0],
                        zIndex: [0, 0, 1, 1, 0]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                        times: [0, 0.49, 0.5, 0.99, 1]
                      }}
                      className="absolute inset-0 rounded-3xl overflow-hidden"
                    >
                      <img
                        src="/payment-slide-2.png"
                        alt="Payment System Slide 2"
                        className="w-full h-full object-cover rounded-3xl"
                      />
                      </motion.div>
              </motion.div>

                  {/* Enhanced Navigation Dots */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
              <motion.div
                      className="w-4 h-4 bg-purple-500/80 rounded-full shadow-lg"
                      animate={{ 
                        scale: [1.2, 1.2, 0.8, 0.8, 1.2],
                        opacity: [1, 1, 0.4, 0.4, 1]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        ease: "linear",
                        times: [0, 0.49, 0.5, 0.99, 1]
                      }}
                    />
                    <motion.div 
                      className="w-4 h-4 bg-purple-500/60 rounded-full shadow-lg"
                      animate={{ 
                        scale: [0.8, 0.8, 1.2, 1.2, 0.8],
                        opacity: [0.4, 0.4, 1, 1, 0.4]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        ease: "linear",
                        times: [0, 0.49, 0.5, 0.99, 1]
                      }}
                    />
                  </div>

                  {/* Progress Bar */}
                  <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-40 h-1 bg-purple-200/30 rounded-full overflow-hidden">
              <motion.div
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                      animate={{ 
                        width: ['0%', '100%', '0%', '100%', '0%'],
                        background: [
                          'linear-gradient(to right, #a855f7, #ec4899)',
                          'linear-gradient(to right, #a855f7, #ec4899)',
                          'linear-gradient(to right, #3b82f6, #8b5cf6)',
                          'linear-gradient(to right, #3b82f6, #8b5cf6)',
                          'linear-gradient(to right, #a855f7, #ec4899)'
                        ]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                        times: [0, 0.49, 0.5, 0.99, 1]
                      }}
                    />
                  </div>
                </div>
              </motion.div>



              {/* Decorative Elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 right-0 w-4 h-4 border-2 border-circlo-yellow rounded-full opacity-30"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-0 left-0 w-6 h-6 border-2 border-circlo-gold rounded-full opacity-20"
              />
            </div>
          </div>

          {/* Bottom Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center"
          >
            <p className="text-sm text-circlo-black/50 mb-8">Trusted by users worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-circlo-glass rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-circlo-black" />
                </div>
                <span className="text-sm font-medium text-circlo-black">Secure Payments</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-circlo-glass rounded-lg flex items-center justify-center">
                  <Eye className="w-4 h-4 text-circlo-black" />
                </div>
                <span className="text-sm font-medium text-circlo-black">Identity Verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-circlo-glass rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-circlo-black" />
                </div>
                <span className="text-sm font-medium text-circlo-black">Community Driven</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section - Flipkart Style */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="py-16 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-2xl font-bold text-gray-900"
            >
              Shop by Category
            </motion.h2>
            <Link 
              to="/listings" 
              className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
            >
              VIEW ALL
            </Link>
          </div>

          {/* Flipkart-style Category Grid */}
          <div className="relative">
            {/* Scroll Container */}
            <div 
              ref={scrollContainerRef}
              className="overflow-x-auto scrollbar-hide scroll-smooth"
              onScroll={checkScrollButtons}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex space-x-8 pb-4 px-2" style={{ minWidth: 'max-content' }}>
                {categories.map((category, index) => {
                  const IconComponent = category.icon;
                  return (
              <motion.div
                key={category.name}
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                      transition={{ 
                        duration: 0.5, 
                        delay: 0.1 * index,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ 
                        y: -8,
                        transition: { duration: 0.2 }
                      }}
                      className="flex-shrink-0"
                    >
                      <Link
                        to={`/listings?category=${category.name.toLowerCase()}`}
                        className="group flex flex-col items-center space-y-4 p-4 hover:bg-blue-50/50 rounded-xl transition-all duration-300"
                        style={{ minWidth: '110px' }}
                      >
                        {/* Icon Container with Enhanced Effects */}
                        <motion.div 
                          className={`w-20 h-20 rounded-full ${category.iconBg} flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300 relative overflow-hidden`}
                          whileHover={{ 
                            scale: 1.15,
                            rotate: [0, -10, 10, 0],
                            transition: { duration: 0.3 }
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {/* Shimmer Effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            initial={{ x: '-100%' }}
                            whileHover={{ 
                              x: '100%',
                              transition: { duration: 0.6, ease: "easeInOut" }
                            }}
                          />
                          
                          <motion.div
                            whileHover={{ 
                              rotate: 360,
                              transition: { duration: 0.5 }
                            }}
                          >
                            <IconComponent className={`w-10 h-10 ${category.iconColor} relative z-10`} />
                          </motion.div>
                        </motion.div>
                        
                        {/* Category Name with Animation */}
                        <motion.div 
                          className="text-center"
                          whileHover={{ scale: 1.05 }}
                        >
                          <p className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                            {category.shortName}
                          </p>
                          {category.count > 0 && (
                            <motion.p 
                              className="text-xs text-gray-500 mt-1"
                              initial={{ opacity: 0.7 }}
                              whileHover={{ opacity: 1 }}
                            >
                              {category.count}+ items
                            </motion.p>
                          )}
                        </motion.div>
                </Link>
              </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Navigation Arrows */}
            <motion.button
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center transition-all duration-300 ${
                canScrollLeft 
                  ? 'text-gray-700 hover:text-blue-600 hover:shadow-2xl cursor-pointer' 
                  : 'text-gray-300 cursor-not-allowed opacity-50'
              }`}
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              whileHover={canScrollLeft ? { 
                scale: 1.1,
                x: -3,
                transition: { type: "spring", stiffness: 400 }
              } : {}}
              whileTap={canScrollLeft ? { scale: 0.95 } : {}}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                animate={canScrollLeft ? { 
                  x: [-1, -3, -1],
                  transition: { 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                } : {}}
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.div>
            </motion.button>

            <motion.button
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-6 w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center transition-all duration-300 ${
                canScrollRight 
                  ? 'text-gray-700 hover:text-blue-600 hover:shadow-2xl cursor-pointer' 
                  : 'text-gray-300 cursor-not-allowed opacity-50'
              }`}
              onClick={scrollRight}
              disabled={!canScrollRight}
              whileHover={canScrollRight ? { 
                scale: 1.1,
                x: 3,
                transition: { type: "spring", stiffness: 400 }
              } : {}}
              whileTap={canScrollRight ? { scale: 0.95 } : {}}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                animate={canScrollRight ? { 
                  x: [1, 3, 1],
                  transition: { 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                } : {}}
              >
                <ChevronRight className="w-6 h-6" />
              </motion.div>
            </motion.button>

            {/* Scroll Indicator Dots */}
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: Math.ceil(categories.length / 6) }).map((_, index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 rounded-full bg-gray-300"
                  whileHover={{ scale: 1.5 }}
                  animate={{
                    backgroundColor: index === 0 ? '#3B82F6' : '#D1D5DB',
                    scale: index === 0 ? 1.2 : 1
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </div>

          {/* Bottom divider with enhanced styling */}
          <motion.div 
            className="mt-8 pt-8 border-t border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Discover thousands of items across all categories
              </p>
              <motion.div
                className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-3"
                initial={{ width: 0 }}
                whileInView={{ width: 96 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 1 }}
              />
          </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Listings */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="py-20 bg-circlo-white relative overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-circlo-yellow/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-circlo-gold/5 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-5xl font-display font-bold text-circlo-black mb-4"
              >
                Featured Items
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-circlo-black/70"
              >
                Hand-picked treasures from our community
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link to="/listings">
                <GlassButton className="group">
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </GlassButton>
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredListings.map((listing, idx) => (
              <div key={listing.id}>
                <Link to={`/listings/${listing.id}`}>
                  <div className="bg-circlo-black/90 rounded-2xl shadow-xl p-6 flex flex-col h-full relative group hover:shadow-2xl transition-all duration-300">
                    {/* Favorite Icon */}
                    <button className="absolute top-4 right-4 text-circlo-gold/80 hover:text-circlo-yellow transition-colors z-10">
                      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' className='w-6 h-6'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' /></svg>
                    </button>
                    {/* Car Image */}
                    <div className="flex-1 flex items-center justify-center mb-4">
                      <img
                        src={listing.images && listing.images.length > 0 ? listing.images[0] : 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800'}
                        alt={listing.title}
                        className="w-48 h-28 object-contain rounded-xl bg-circlo-white/10 group-hover:shadow-lg"
                      />
                    </div>
                    {/* Title & Subtitle */}
                    <div className="mb-2">
                      <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                        {listing.title}
                        {listing.isVaultItem && (
                          <span className="ml-2 px-2 py-0.5 rounded bg-circlo-gold/20 text-circlo-gold text-xs font-semibold">Vault</span>
                        )}
                      </h3>
                      <p className="text-circlo-gold/80 text-sm font-medium">{listing.category}</p>
                    </div>
                    {/* Bottom Row */}
                    <div className="flex items-end justify-between mt-auto pt-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="user" className="w-6 h-6 rounded-full border-2 border-circlo-gold" />
                          <span className="text-white text-sm font-semibold">{listing.rating}</span>
                          <span className="text-circlo-gold/70 text-xs">• 85% Recommended</span>
                        </div>
                        <span className="text-circlo-gold/70 text-xs">Driver</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-lg font-bold">₹{listing.price}<span className="text-circlo-gold/70 text-xs font-normal">/{listing.priceUnit}</span></div>
                        <button className="mt-2 px-5 py-2 bg-circlo-gold text-circlo-black font-bold rounded-lg shadow hover:bg-circlo-yellow transition-colors text-sm">Rent Now</button>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Cultural Vault Preview */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="py-20 bg-gradient-to-br from-circlo-yellow/5 via-circlo-gold/10 to-circlo-yellow/5 relative overflow-hidden"
      >
        {/* Marquee Background Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ x: [-1000, 1000] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 w-full h-1 bg-gradient-to-r from-transparent via-circlo-yellow/30 to-transparent"
          />
          <motion.div
            animate={{ x: [1000, -1000] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 w-full h-1 bg-gradient-to-r from-transparent via-circlo-gold/30 to-transparent"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-4xl sm:text-5xl font-display font-bold text-circlo-black mb-6"
            >
              The Cultural Vault
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-circlo-black/70 max-w-3xl mx-auto"
            >
              Discover rare and unique items with fascinating stories. Each piece in our vault 
              carries history, culture, and extraordinary experiences.
            </motion.p>
          </div>

          {/* Yellow-Gold Neon Border Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-gold rounded-glass-lg opacity-75 blur-sm animate-pulse" />
            <GlassCard className="relative p-12 text-center glow-border">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1] 
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="text-8xl mb-6"
              >
                🏛️
              </motion.div>
              
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-3xl font-display font-bold mb-6 gradient-text"
              >
                Curated Treasures
              </motion.h3>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-circlo-black/70 mb-8 max-w-2xl mx-auto text-lg leading-relaxed"
              >
                From vintage cameras used by famous photographers to designer pieces worn by celebrities, 
                explore items that tell incredible stories of human creativity and heritage.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                <Link to="/cultural-vault">
                  <GlassButton 
                    size="lg" 
                    className="bg-gradient-gold text-circlo-black font-bold shadow-glow group"
                  >
                    <span className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
                      Preserve Heritage
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </GlassButton>
                </Link>
              </motion.div>
            </GlassCard>
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="py-20 bg-gradient-to-b from-circlo-white to-circlo-neutral-100/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl font-display font-bold text-circlo-black mb-6"
            >
              How Circlo Works
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-circlo-black/70 max-w-3xl mx-auto"
            >
              Simple, safe, and secure. Start renting or lending in just a few clicks.
            </motion.p>
          </div>

          {/* 4 Circular Glass Cards with Timeline */}
          <div className="relative">
            {/* Curved Timeline Path */}
            <div className="hidden md:block absolute inset-0 pointer-events-none">
              <svg className="w-full h-full">
                <path
                  d="M150,200 Q400,100 650,200 Q900,300 1150,200"
                  stroke="url(#timelineGradient)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="10,5"
                  className="animate-pulse"
                />
                <defs>
                  <linearGradient id="timelineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFD700" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#FFB800" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#FFD700" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {[
                {
                  icon: Search,
                  step: "1",
                  title: "Browse & Discover",
                  description: "Explore thousands of items from your local community. Use smart filters to find exactly what you need.",
                  delay: 0
                },
                {
                  icon: Heart,
                  step: "2", 
                  title: "Connect & Chat",
                  description: "Message the owner directly through our secure chat. Ask questions and arrange pickup details.",
                  delay: 0.2
                },
                {
                  icon: Shield,
                  step: "3",
                  title: "Rent Safely",
                  description: "Complete secure payment and verification. Our trust system ensures safe transactions for everyone.",
                  delay: 0.4
                },
                {
                  icon: Star,
                  step: "4",
                  title: "Enjoy & Review",
                  description: "Use the item and return it safely. Rate your experience and build your community karma.",
                  delay: 0.6
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50, rotateY: -20 }}
                  whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: step.delay }}
                  className="relative"
                >
                  <GlassCard
                    hover={true}
                    className="text-center p-8 h-full group"
                  >
                    {/* Step Number Circle */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center text-circlo-black font-bold shadow-glass-hover"
                      >
                        {step.step}
                      </motion.div>
                    </div>

                    {/* Animated Icon */}
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="mb-6 mt-4"
                    >
                      <GlassIcon
                        icon={step.icon}
                        size="xl"
                        animate={true}
                        className="mx-auto group-hover:shadow-glass-hover"
                      />
                    </motion.div>

                    <h3 className="text-xl font-semibold text-circlo-black mb-4 group-hover:gradient-text transition-all">
                      {step.title}
                    </h3>
                    <p className="text-circlo-black/70 leading-relaxed">
                      {step.description}
                    </p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Trust & Safety - Glass Style */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="py-20 bg-gradient-to-t from-circlo-neutral-100/20 to-circlo-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl sm:text-5xl font-display font-bold text-circlo-black mb-8">
                Built on Trust & Community
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: Shield,
                    title: "Verified Users",
                    description: "All users are verified through our comprehensive identity and background check process."
                  },
                  {
                    icon: Heart,
                    title: "Karma System", 
                    description: "Build trust through our karma point system. Great renters and lenders earn rewards and recognition."
                  },
                  {
                    icon: Users,
                    title: "Community Support",
                    description: "Join a community that values sharing, sustainability, and meaningful connections."
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 * index }}
                    className="flex items-start space-x-4"
                  >
                    <GlassIcon
                      icon={feature.icon}
                      size="md"
                      className="mt-1 flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-circlo-black mb-2">{feature.title}</h3>
                      <p className="text-circlo-black/70 leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <GlassCard className="p-10 text-center">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="text-6xl mb-6"
                >
                  🌟
                </motion.div>
                <h3 className="text-2xl font-display font-bold gradient-text mb-4">Join Our Community</h3>
                <p className="text-circlo-black/70 mb-8 leading-relaxed">
                  Start building your karma and connecting with amazing people in your neighborhood.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <GlassCounter
                    number="4.9★"
                    label="Average Rating"
                    className="p-4"
                  />
                  <GlassCounter
                    number="99%"
                    label="Happy Users"
                    className="p-4"
                  />
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;