import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export interface ListingItem {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  priceUnit: 'day' | 'hour' | 'week';
  images: string[];
  location: string;
  availability: string[];
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  rating: number;
  reviewCount: number;
  isVaultItem?: boolean;
  vaultStory?: string;
  securityDeposit?: number;
  deliveryFee?: number;
  createdAt: string;
}

interface AppContextType {
  listings: ListingItem[];
  loading: boolean;
  addListing: (listing: Omit<ListingItem, 'id' | 'createdAt'>) => void;
  updateListing: (id: string, updates: Partial<ListingItem>) => void;
  deleteListing: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  fetchListings: () => Promise<void>;
  fetchUserListings: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export { useApp };

// Helper function to transform database data to frontend format
const transformDatabaseItem = (dbItem: any): ListingItem => {
  console.log('🔄 Transforming database item:', dbItem);
  
  const transformed = {
    id: dbItem.id || dbItem.ID,
    title: dbItem.title || dbItem.TITLE || '',
    description: dbItem.description || dbItem.DESCRIPTION || '',
    category: dbItem.category || dbItem.CATEGORY || '',
    price: parseFloat(dbItem.price || dbItem.PRICE || 0),
    priceUnit: (dbItem.price_unit || dbItem.PRICE_UNIT || 'day') as 'day' | 'hour' | 'week',
    images: dbItem.images || [], // Will be populated from Photos table if needed
    location: dbItem.location || dbItem.LOCATION || '',
    availability: dbItem.availability || [],
    ownerId: dbItem.owner_id || dbItem.OWNER_ID || dbItem.ownerId,
    ownerName: dbItem.owner_name || dbItem.OWNER_NAME || dbItem.ownerName || 'Unknown',
    ownerAvatar: dbItem.owner_avatar || dbItem.ownerAvatar,
    rating: parseFloat(dbItem.avg_rating || dbItem.AVG_RATING || dbItem.rating || 0),
    reviewCount: parseInt(dbItem.review_count || dbItem.REVIEW_COUNT || dbItem.reviewCount || 0),
    isVaultItem: Boolean(dbItem.is_vault_item || dbItem.IS_VAULT_ITEM || dbItem.isVaultItem),
    vaultStory: dbItem.vault_story || dbItem.VAULT_STORY || dbItem.vaultStory,
    securityDeposit: parseFloat(dbItem.security_deposit || dbItem.SECURITY_DEPOSIT || dbItem.securityDeposit || 0),
    deliveryFee: parseFloat(dbItem.delivery_fee || dbItem.DELIVERY_FEE || dbItem.deliveryFee || 0),
    createdAt: dbItem.created_at || dbItem.CREATED_AT || dbItem.createdAt || new Date().toISOString(),
  };
  
  console.log('✅ Transformed item:', transformed);
  return transformed;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState<ListingItem[]>([]);

  // Fetch all listings from API
  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getListings({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
      });
      
      if (response.success && response.data) {
        // Transform database data to frontend format
        const transformedListings = Array.isArray(response.data) 
          ? response.data.map(transformDatabaseItem)
          : [];
        setListings(transformedListings);
        console.log('✅ Fetched listings:', transformedListings.length);
      } else {
        console.error('Failed to fetch listings:', response.error);
        setListings([]);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  // Fetch user's own listings
  const fetchUserListings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getUserListings();
      
      if (response.success && response.data) {
        // Transform database data to frontend format
        const transformedListings = Array.isArray(response.data) 
          ? response.data.map(transformDatabaseItem)
          : [];
        setListings(transformedListings);
        console.log('✅ Fetched user listings:', transformedListings.length);
      } else {
        console.error('Failed to fetch user listings:', response.error);
        setListings([]);
      }
    } catch (error) {
      console.error('Error fetching user listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load listings on component mount and when filters change
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const addListing = (listing: Omit<ListingItem, 'id' | 'createdAt'>) => {
    const newListing: ListingItem = {
      ...listing,
      id: Math.random().toString(),
      createdAt: new Date().toISOString()
    };
    setListings(prev => [newListing, ...prev]);
  };

  const updateListing = (id: string, updates: Partial<ListingItem>) => {
    setListings(prev => prev.map(listing => 
      listing.id === id ? { ...listing, ...updates } : listing
    ));
  };

  const deleteListing = (id: string) => {
    setListings(prev => prev.filter(listing => listing.id !== id));
  };

  const value = {
    listings,
    loading,
    addListing,
    updateListing,
    deleteListing,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    fetchListings,
    fetchUserListings,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};