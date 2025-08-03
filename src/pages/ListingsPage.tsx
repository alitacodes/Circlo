import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Search, Filter, MapPin, Star, Calendar, Smartphone, Shirt, Wrench, Sparkles, ChevronLeft, ChevronRight, Heart, Car, Baby, Dumbbell, Book, Sofa } from 'lucide-react';
import { motion } from 'framer-motion';

const ListingsPage: React.FC = () => {
  const { listings, searchQuery, setSearchQuery, fetchListings, loading } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Fetch listings when component mounts or filters change
  useEffect(() => {
    console.log('🔄 ListingsPage: Fetching listings...');
    fetchListings();
  }, [fetchListings]);

  // Debug effect to log listings changes
  useEffect(() => {
    console.log('📊 ListingsPage: Current listings:', listings.length);
    console.log('📊 ListingsPage: Loading state:', loading);
  }, [listings, loading]);

  // Update search params when category changes
  useEffect(() => {
    if (selectedCategory !== 'all') {
      setSearchParams({ category: selectedCategory });
    } else {
      setSearchParams({});
    }
  }, [selectedCategory, setSearchParams]);

  const categories = ['all', 'electronics', 'fashion', 'tools', 'toys', 'auto', 'sports', 'books', 'furniture', 'culture'];
  
  const categoryData = [
    {
      id: 'all',
      name: 'All Categories',
      description: 'Browse all available items across every category',
      icon: Search,
      gradient: 'from-slate-600 to-slate-700',
      image: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2'
    },
    {
      id: 'electronics',
      name: 'Electronics',
      description: 'Latest gadgets and tech equipment for all your digital needs',
      icon: Smartphone,
      gradient: 'from-blue-600 to-purple-700',
      image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2'
    },
    {
      id: 'fashion',
      name: 'Fashion',
      description: 'Trendy clothing and fashion accessories for every occasion',
      icon: Shirt,
      gradient: 'from-pink-500 to-rose-600',
      image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2'
    },
    {
      id: 'tools',
      name: 'Tools & Equip',
      description: 'Professional tools and equipment for work and projects',
      icon: Wrench,
      gradient: 'from-orange-500 to-red-600',
      image: 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2'
    },
    {
      id: 'toys',
      name: 'Toys, Baby',
      description: 'Toys and baby products for all ages',
      icon: Baby,
      gradient: 'from-purple-500 to-pink-500',
      image: 'https://images.pexels.com/photos/3661352/pexels-photo-3661352.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2'
    },
    {
      id: 'auto',
      name: 'Auto Accessories',
      description: 'Car and bike accessories for your ride',
      icon: Car,
      gradient: 'from-red-500 to-yellow-600',
      image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2'
    },
    {
      id: 'sports',
      name: 'Sports & Fit',
      description: 'Sports, fitness, and outdoor equipment',
      icon: Dumbbell,
      gradient: 'from-green-500 to-blue-500',
      image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2'
    },
    {
      id: 'books',
      name: 'Books & Med',
      description: 'Books, study, and medical resources',
      icon: Book,
      gradient: 'from-yellow-500 to-orange-400',
      image: 'https://images.pexels.com/photos/590493/pexels-photo-590493.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2'
    },
    {
      id: 'furniture',
      name: 'Furniture',
      description: 'Home and office furniture for every space',
      icon: Sofa,
      gradient: 'from-indigo-500 to-purple-400',
      image: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2'
    },
    {
      id: 'culture',
      name: 'Cultural Vault',
      description: 'Unique cultural items and traditional artifacts',
      icon: Sparkles,
      gradient: 'from-amber-500 to-yellow-600',
      image: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2'
    }
  ];

  const filteredAndSortedListings = useMemo(() => {
    let filtered = listings.filter(listing => {
      const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           listing.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
                             listing.category.toLowerCase() === selectedCategory ||
                             (selectedCategory === 'culture' && listing.isVaultItem);
      
      const matchesPrice = (!priceRange.min || listing.price >= parseInt(priceRange.min)) &&
                          (!priceRange.max || listing.price <= parseInt(priceRange.max));
      
      const matchesLocation = !locationFilter || (listing.location || '').toLowerCase().includes(locationFilter.toLowerCase());
      
      return matchesSearch && matchesCategory && matchesPrice && matchesLocation;
    });

    // Sort listings
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return filtered;
  }, [listings, searchQuery, selectedCategory, sortBy, priceRange, locationFilter]);

  return (
    <div className="min-h-screen bg-white font-['Inter','Poppins',sans-serif]">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-sm border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Items</h1>
              <p className="text-gray-600 text-lg">
                {loading ? 'Loading...' : `${filteredAndSortedListings.length} items available`}
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Explore Categories Section */}
      <div className="gradient-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-circlo-black mb-2">Explore Categories</h2>
              <p className="text-circlo-black/70 text-lg">
                Discover amazing items across different categories • {loading ? 'Loading...' : `${listings.length} items available`}
              </p>
            </div>
            <button 
              className="gradient-text font-semibold flex items-center space-x-1"
              onClick={() => setSelectedCategory('all')}
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            {/* Navigation Arrows */}
            <button
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 glass-card backdrop-blur-md rounded-full flex items-center justify-center text-circlo-black opacity-70"
              onClick={() => {
                if (categoryScrollRef.current) {
                  categoryScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
                }
              }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center text-circlo-black shadow-lg"
              onClick={() => {
                if (categoryScrollRef.current) {
                  categoryScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                }
              }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Category Cards */}
            <div
              ref={categoryScrollRef}
              className="overflow-x-auto scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex space-x-8 pb-4 px-2" style={{ minWidth: 'max-content' }}>
                {categoryData.map((category, index) => {
                  const IconComponent = category.icon;
                  const itemCount = category.id === 'all' 
                    ? listings.length 
                    : listings.filter(item => 
                        category.id === 'culture' ? item.isVaultItem : item.category.toLowerCase() === category.id
                      ).length;
                  const isSelected = selectedCategory === category.id;

                  return (
                    <div
                      key={category.id}
                      className="group cursor-pointer"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div className={`glass-card backdrop-blur-sm rounded-2xl overflow-hidden border transition-all duration-300 relative w-48 h-56 min-w-48 max-w-48`}>
                        {/* Gold gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-circlo-gold/10 via-transparent to-circlo-yellow/5 pointer-events-none"></div>
                        
                        {/* Inner gold accent */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-circlo-gold/20 to-transparent rounded-2xl pointer-events-none"></div>
                        
                        {/* Bottom gold accent bar */}
                        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-circlo-gold via-circlo-yellow to-circlo-gold pointer-events-none ${
                          isSelected ? 'opacity-100' : 'opacity-60'
                        }`}></div>
                        
                        {/* Selected state enhancement */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-gradient-to-br from-circlo-gold/5 via-circlo-yellow/3 to-circlo-gold/10 pointer-events-none"></div>
                        )}
                        {/* Header */}
                        <div className="p-4 pb-2 relative z-10">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                                isSelected 
                                  ? 'bg-gradient-gold' 
                                  : `bg-gradient-to-r ${category.gradient}`
                              }`}>
                                <IconComponent className={`w-5 h-5 transition-colors duration-300 ${
                                  isSelected ? 'text-circlo-black' : 'text-white'
                                }`} />
                              </div>
                              <div>
                                <h3 className="text-circlo-black font-semibold text-lg">{category.name}</h3>
                                <p className="text-circlo-black/60 text-sm">{itemCount} items</p>
                              </div>
                            </div>
                            <button className="text-circlo-black/50">
                              <Heart className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Image */}
                        <div className="px-4 mb-4 relative z-10">
                          <div className="relative overflow-hidden rounded-xl h-24">
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-circlo-gold/10"></div>
                            
                            {/* Gold shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-circlo-gold/20 to-transparent opacity-0"></div>
                            
                            {isSelected && (
                              <div className="absolute inset-0 bg-circlo-gold/20 flex items-center justify-center">
                                <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center shadow-lg">
                                  <svg className="w-4 h-4 text-circlo-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="px-4 pb-4 relative z-10">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-circlo-black/70 text-sm mb-2">{category.description}</p>
                              <div className="flex items-center space-x-2">
                                <div className="flex -space-x-2">
                                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full border-2 border-white shadow-sm"></div>
                                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full border-2 border-white shadow-sm"></div>
                                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full border-2 border-white shadow-sm"></div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-3 h-3 text-circlo-gold fill-current" />
                                  <span className="text-circlo-black/60 text-xs font-medium">4.8</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <button 
                            className={`w-full mt-3 py-2 px-4 rounded-lg font-semibold text-sm ${
                              isSelected
                                ? 'bg-gradient-gold text-circlo-black shadow-lg shadow-circlo-gold/25'
                                : `bg-gradient-to-r ${category.gradient} text-white`
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCategory(category.id);
                            }}
                          >
                            {isSelected ? '✓ Selected' : 'Browse Now'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:w-72 flex-shrink-0"
          >
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h3 className="text-xl font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-[#FFD700] p-2 rounded-lg"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
              
              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Categories */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Categories</h4>
                  <div className="space-y-3">
                    {categories.map(category => (
                      <label key={category} className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={selectedCategory === category}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="text-[#FFD700] focus:ring-[#FFD700] border-gray-300"
                        />
                        <span className="ml-3 text-sm text-gray-700 capitalize">
                          {category === 'all' ? 'All Categories' : category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Price Range</h4>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all"
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Sort By</h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Location</h4>
                  <input
                    type="text"
                    placeholder="Enter city or area"
                    value={locationFilter}
                    onChange={e => setLocationFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Listings Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1"
          >
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading items...</p>
              </div>
            ) : filteredAndSortedListings.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">No items found</h3>
                <p className="text-gray-600 text-lg">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedListings.map((listing, index) => (
                  <div key={listing.id} className="group">
                    <Link
                      to={`/listings/${listing.id}`}
                      className="bg-white rounded-2xl shadow-md overflow-hidden block"
                    >
                      <div className="relative">
                        <img
                          src={listing.images && listing.images.length > 0 ? listing.images[0] : 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800'}
                          alt={listing.title}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800';
                          }}
                        />
                        {listing.isVaultItem && (
                          <div className="absolute top-3 left-3 bg-[#FFD700] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                            Vault Item
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1 shadow-md">
                          <Star className="w-3 h-3 text-[#FFD700] fill-current" />
                          <span className="text-xs font-semibold">{listing.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                          {listing.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {listing.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-1">
                            <span className="text-2xl font-bold text-gray-900">₹{listing.price}</span>
                            <span className="text-gray-500 text-sm">/{listing.priceUnit}</span>
                          </div>
                          <span className="text-xs text-[#FFD700] bg-yellow-50 px-3 py-1 rounded-full font-medium">
                            {listing.category}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{listing.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Available</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ListingsPage;