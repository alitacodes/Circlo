import React, { useState, useEffect, useRef, useCallback, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import { Upload, X, Plus } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAuth } from '../contexts/AuthContext';
import LocationPicker from '../components/LocationPicker';
import ImageAIAnalysis from '../components/ImageAIAnalysis';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import CulturalVaultBadge from '../components/CulturalVaultBadge';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

// Types
type PriceUnit = 'hour' | 'day' | 'week';

interface ListingFormData {
  title: string;
  description: string;
  category: string;
  condition: string;
  price: string;
  priceUnit: PriceUnit;
  images: string[];
  location: string;
  brand: string;
  size: string;
  availability: string[];
  isVaultItem: boolean;
  vaultStory: string;
}

interface UIState {
  isSubmitting: boolean;
  error: string;
  success: boolean;
  dragActive: boolean;
  aiAnalysisKey: number;
  aiAnalysisResults: Array<{ description: string | null }>;
}

// Constants
const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Tools',
  'Sports',
  'Books',
  'Home & Garden',
  'Art & Culture',
  'Music',
  'Other'
] as const;

// Initial states
const defaultFormData: ListingFormData = {
  title: '',
  description: '',
  category: '',
  condition: '',
  price: '',
  priceUnit: 'day',
  images: [],
  location: '',
  brand: '',
  size: '',
  availability: [], // Ensure this is always an array
  isVaultItem: false,
  vaultStory: ''
};

const initialUIState: UIState = {
  isSubmitting: false,
  error: '',
  success: false,
  dragActive: false,
  aiAnalysisKey: 0,
  aiAnalysisResults: []
};

// Utility function for Gemini Vision API
const processImageForVision = async (imageUrl: string): Promise<{ description: string | null }> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    const imageResponse = await fetch(imageUrl);
    const blob = await imageResponse.blob();

    const result = await model.generateContent([
      'Analyze this item listing photo and provide a brief description',
      { inlineData: { data: await blob.arrayBuffer(), mimeType: blob.type } }
    ]);

    const text = await result.response.text();
    return { description: text };
  } catch (error) {
    console.error('Error analyzing image with Gemini Vision:', error);
    return { description: null };
  }
};

// Main component
const AddListingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State management
  const [formData, setFormData] = useState<ListingFormData>(defaultFormData);
  const [uiState, setUIState] = useState<UIState>(initialUIState);

  // Mock: is the user Aadhaar-verified?
  const isAadhaarVerified = true; // Set to true for demo; replace with real check later

  // Protection against unauthorized access
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Event handlers
  const handleImageUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      setUIState(prev => ({ ...prev, error: 'Please upload image files only' }));
      return;
    }

    const newImages: string[] = [];
    const newAnalysisResults: { description: string | null }[] = [];

    for (const file of imageFiles) {
      const imageUrl = URL.createObjectURL(file);
      newImages.push(imageUrl);

      // Analyze image with Gemini Vision API
      const result = await processImageForVision(imageUrl);
      newAnalysisResults.push(result);
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, 5) // Max 5 images
    }));
    setUIState(prev => ({
      ...prev,
      aiAnalysisResults: [...prev.aiAnalysisResults, ...newAnalysisResults],
      aiAnalysisKey: prev.aiAnalysisKey + 1
    }));
  }, []);

  const removeImage = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setUIState(prev => ({
      ...prev,
      aiAnalysisResults: prev.aiAnalysisResults.filter((_, i) => i !== index)
    }));
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  }, []);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setUIState(prev => ({
      ...prev,
      dragActive: e.type === 'dragenter' || e.type === 'dragover'
    }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setUIState(prev => ({ ...prev, dragActive: false }));
    handleImageUpload(e.dataTransfer.files);
  }, [handleImageUpload]);

  // Safe availability change handler
  const handleAvailabilityChange = useCallback((availability: string[]) => {
    setFormData(prev => ({
      ...prev,
      availability: Array.isArray(availability) ? availability : []
    }));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUIState(prev => ({ ...prev, isSubmitting: true, error: '' }));

    try {
      // Debug logging
      console.log('Form Data:', {
        title: formData.title,
        category: formData.category,
        price: formData.price,
        condition: formData.condition,
        location: formData.location
      });

      // Enhanced validation
      if (!formData.title || !formData.category || !formData.price || !formData.condition || !formData.location) {
        const missingFields = [
          !formData.title && 'title',
          !formData.category && 'category',
          !formData.price && 'price',
          !formData.condition && 'condition',
          !formData.location && 'location'
        ].filter(Boolean);
        
        throw new Error(`Please fill in all required fields. Missing: ${missingFields.join(', ')}`);
      }

      if (formData.images.length === 0) {
        throw new Error('Please add at least one image');
      }

      // Validate price is a number
      const numericPrice = parseFloat(formData.price);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        throw new Error('Please enter a valid price');
      }

      // Create FormData for submission
      const submitData = new FormData();
      
      // Add required fields first
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('category', formData.category);
      submitData.append('condition', formData.condition);
      submitData.append('price', numericPrice.toString());
      submitData.append('priceUnit', formData.priceUnit);
      submitData.append('location', formData.location.trim());
      
      // Add optional fields
      if (formData.brand) submitData.append('brand', formData.brand.trim());
      if (formData.size) submitData.append('size', formData.size.trim());
      
      // Handle availability array
      if (formData.availability.length > 0) {
        submitData.append('availability', formData.availability.join(','));
      }
      
      // Handle vault items
      if (formData.isVaultItem) {
        submitData.append('isVaultItem', 'true');
        if (formData.vaultStory) {
          submitData.append('vaultStory', formData.vaultStory.trim());
        }
      }

      // Process and append images
      await Promise.all(formData.images.map(async (image, index) => {
        if (image.startsWith('data:')) {
          const response = await fetch(image);
          const blob = await response.blob();
          const file = new File([blob], `image_${index}.jpg`, { type: 'image/jpeg' });
          submitData.append(`image_${index}`, file);
        } else {
          submitData.append(`image_${index}`, image);
        }
      }));

      // Submit to API
      const response = await apiService.createListing(submitData);
      console.log('API Response:', response); // Debug log

      if (response.success) {
        setUIState(prev => ({ ...prev, success: true }));
        setTimeout(() => navigate('/listings'), 2000);
      } else {
        throw new Error(response.error || 'Failed to create listing');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      
      // Extract the most helpful error message
      let errorMessage = 'Failed to create listing';
      if (error instanceof Error) {
        errorMessage = error.message;
        // If it's an API error response
        if (error.message.includes('Failed to create listing') && (error as any).details) {
          errorMessage = `${error.message}: ${(error as any).details}`;
        }
      }
      
      setUIState(prev => ({
        ...prev,
        error: errorMessage
      }));
    } finally {
      setUIState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleAIAnalysisComplete = (results: any[]) => {
    setUIState(prev => ({ ...prev, aiAnalysisResults: results }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white font-['Inter','Poppins',sans-serif] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to list an item</h2>
          <button
            onClick={() => navigate('/login')}
            className="bg-[#FFD700] text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition-colors shadow-md hover:shadow-lg"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-['Inter','Poppins',sans-serif] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="px-8 py-8 border-b border-gray-100 bg-gradient-to-r from-white to-yellow-50">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">List Your Item</h1>
            <p className="text-gray-600 text-lg">Share your items with the community and earn money</p>
          </div>

          {uiState.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mx-8 mt-4">
              {uiState.error}
            </div>
          )}

          {uiState.success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mx-8 mt-4">
              Listing created successfully! Redirecting to listings...
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            {/* Basic Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-8"
            >
              <h2 className="text-2xl font-semibold text-gray-900">Basic Information</h2>
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-3">
                  Item Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all shadow-sm hover:shadow-md"
                  placeholder="e.g., Canon EOS R5 Camera"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-3">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  minLength={10}
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all shadow-sm hover:shadow-md"
                  placeholder="Describe your item, its condition, and any special features (minimum 10 characters)..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-3">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all shadow-sm hover:shadow-md"
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-3">
                    Condition *
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    required
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all shadow-sm hover:shadow-md"
                  >
                    <option value="">Select condition</option>
                    <option value="new">New</option>
                    <option value="like_new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="needs_repair">Needs Repair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Location *
                  </label>
                  <LocationPicker
                    location={formData.location}
                    onChange={(location) => setFormData(prev => ({ ...prev, location }))}
                  />
                </div>
              </div>

              {/* Availability Calendar - Fixed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Availability (select all available dates)
                </label>
                <AvailabilityCalendar
                  availability={formData.availability || []} // Ensure it's never undefined
                  onChange={handleAvailabilityChange} // Use the safe handler
                />
              </div>

              {/* Cultural Vault */}
              {isAadhaarVerified && (
                <div className="mt-6">
                  <label className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      name="isVaultItem"
                      checked={formData.isVaultItem}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-[#FFD700] focus:ring-[#FFD700] border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-800 font-medium flex items-center gap-2">
                      <CulturalVaultBadge />
                      Mark as Cultural Vault item
                    </span>
                  </label>
                  {formData.isVaultItem && (
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Share the story or significance of this item (optional)
                      </label>
                      <textarea
                        name="vaultStory"
                        value={formData.vaultStory}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all"
                        placeholder="Describe the cultural or heritage value..."
                      />
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Pricing */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              <h2 className="text-2xl font-semibold text-gray-900">Pricing</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-3">
                    Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 font-bold">₹</span>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all shadow-sm hover:shadow-md"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="priceUnit" className="block text-sm font-medium text-gray-700 mb-3">
                    Per *
                  </label>
                  <select
                    id="priceUnit"
                    name="priceUnit"
                    required
                    value={formData.priceUnit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all shadow-sm hover:shadow-md"
                  >
                    <option value="hour">Hour</option>
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Images */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-8"
            >
              <h2 className="text-2xl font-semibold text-gray-900">Photos</h2>
              
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  uiState.dragActive ? 'border-[#FFD700] bg-yellow-50' : 'border-gray-300 hover:border-[#FFD700] hover:bg-yellow-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">Upload photos of your item</p>
                <p className="text-gray-600 mb-6">Drag and drop files here, or click to select</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                  id="image-upload"
                  ref={fileInputRef}
                />
                <label
                  htmlFor="image-upload"
                  className="bg-[#FFD700] text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition-colors cursor-pointer inline-block shadow-md hover:shadow-lg"
                >
                  Choose Files
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {uiState.aiAnalysisResults[index]?.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {uiState.aiAnalysisResults[index].description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* AI Image Analysis */}
            {formData.images.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-8"
              >
                <ImageAIAnalysis
                  key={uiState.aiAnalysisKey}
                  images={formData.images}
                  onAnalysisComplete={handleAIAnalysisComplete}
                  mode="pre_rental"
                />
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex justify-end space-x-4 pt-8 border-t border-gray-100"
            >
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uiState.isSubmitting}
                className="px-8 py-3 bg-[#FFD700] text-gray-900 rounded-xl font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-md hover:shadow-lg"
              >
                {uiState.isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Publish Listing</span>
                  </>
                )}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddListingPage;