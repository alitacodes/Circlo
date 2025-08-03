import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Star, 
  MapPin, 
  Calendar, 
  Shield, 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight,
  Heart,
  Share2,
  Award,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import CulturalVaultBadge from '../components/CulturalVaultBadge';
import RazorpayPayment from '../components/RazorpayPayment';
import { apiService } from '../services/api';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { listings } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [reviews, setReviews] = useState<{
    name: string;
    rating: number;
    comment: string;
    date: string;
  }[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingId, setBookingId] = useState<string>('');
  const [bookingDates, setBookingDates] = useState({ startDate: '', endDate: '' });

  // Mock: completed bookings for this user and item
  const completedBookings = [
    { userId: user?.id, listingId: listings.find(l => l.id === id)?.id }
    // Add more mock bookings as needed
  ];

  // Check if user can review
  const canReview =
    user &&
    listings.find(l => l.id === id) &&
    completedBookings.some(
      b => b.userId === user.id && b.listingId === id
    ) &&
    !reviews.some(r => r.name === user.name); // or use user.id if available

  const listing = listings.find(l => l.id === id);

  if (!listing) {
    return (
      <div className="min-h-screen bg-white font-['Inter','Poppins',sans-serif] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Item not found</h2>
          <Link to="/listings" className="text-[#FFD700] hover:text-yellow-600">
            Back to listings
          </Link>
        </div>
      </div>
    );
  }

  const handleBookNow = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/listings/${id}` } } });
      return;
    }

    try {
      // Create booking first
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1);

      const bookingResponse = await apiService.createBooking({
        item_id: id!,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      });

      if (bookingResponse.success) {
        setBookingId(bookingResponse.data?.bookingId || '');
        setBookingDates({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        });
        setShowPaymentModal(true);
      } else {
        alert('Failed to create booking. Please try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  const handleConfirmBooking = async () => {
    try {
      const bookingResponse = await apiService.createBooking({
        item_id: id!,
        start_date: bookingDates.startDate,
        end_date: bookingDates.endDate,
      });

      if (bookingResponse.success) {
        setShowCreditModal(false);
        alert(`Booking successful! Used ${requiredCredits} credits. Remaining: ${userCredits - requiredCredits} credits.`);
        // Refresh user credits
        const creditsResponse = await apiService.getUserCredits();
        if (creditsResponse.success) {
          setUserCredits(creditsResponse.data?.credits || 0);
        }
      } else {
        alert('Failed to create booking. Please try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  const handleCreditCancel = () => {
    setShowCreditModal(false);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setShowPaymentModal(false);
    alert(`Payment successful! Payment ID: ${paymentId}`);
    // You can navigate to a success page or show a success message
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  return (
    <div className="min-h-screen bg-white font-['Inter','Poppins',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <motion.nav 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center space-x-2 text-sm text-gray-500 mb-8"
        >
          <Link to="/" className="hover:text-[#FFD700] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/listings" className="hover:text-[#FFD700] transition-colors">Listings</Link>
          <span>/</span>
          <span className="text-gray-900">{listing.title}</span>
        </motion.nav>

        {/* Report a Problem Button & Form */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-end mb-6"
        >
          {!reportSubmitted ? (
            showReportForm ? (
              <form
                className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 w-full max-w-md"
                onSubmit={e => {
                  e.preventDefault();
                  setReportSubmitted(true);
                }}
              >
                <h3 className="text-lg font-semibold mb-4">Report a Problem</h3>
                <label className="block mb-2 text-sm font-medium">Reason</label>
                <select
                  className="border border-gray-200 rounded-lg px-3 py-2 w-full mb-4 focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all"
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  required
                >
                  <option value="">Select a reason...</option>
                  <option value="not_described">Item not as described</option>
                  <option value="unresponsive">Owner unresponsive</option>
                  <option value="damaged">Item was damaged</option>
                  <option value="other">Other</option>
                </select>
                <label className="block mb-2 text-sm font-medium">Description</label>
                <textarea
                  className="border border-gray-200 rounded-lg px-3 py-2 w-full mb-4 focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all"
                  rows={3}
                  value={reportDesc}
                  onChange={e => setReportDesc(e.target.value)}
                  placeholder="Describe the issue..."
                  required
                />
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={() => setShowReportForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </form>
            ) : (
              <button
                className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border border-red-200 transition-colors"
                onClick={() => setShowReportForm(true)}
              >
                Report a Problem
              </button>
            )
          ) : (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow w-full max-w-md text-center">
              Thank you! Your report has been submitted.
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg">
              <img
                src={listing.images && listing.images.length > 0 ? listing.images[currentImageIndex] : 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800'}
                alt={listing.title}
                className="w-full h-96 object-cover"
              />
              
              {listing.images && listing.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {listing.isVaultItem && (
                <div className="absolute top-4 left-4 bg-[#FFD700] text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 shadow-md">
                  <Award className="w-4 h-4" />
                  <span>Vault Item</span>
                </div>
              )}

              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`p-3 rounded-full shadow-lg transition-all hover:scale-110 ${
                    isFavorited ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-red-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
                <button className="p-3 bg-white text-gray-600 rounded-full shadow-lg hover:bg-gray-50 transition-all hover:scale-110">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image Thumbnails */}
            {listing.images && listing.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                      currentImageIndex === index ? 'border-[#FFD700]' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${listing.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-8"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-[#FFD700] bg-opacity-10 text-[#FFD700] border border-[#FFD700] border-opacity-20">
                  {listing.category}
                </span>
                {listing.isVaultItem && (
                  <span className="ml-2">
                    <CulturalVaultBadge />
                  </span>
                )}
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-[#FFD700] fill-current" />
                  <span className="font-semibold">{listing.rating}</span>
                  <span className="text-gray-500">({listing.reviewCount} reviews)</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{listing.title}</h1>
              <p className="text-gray-600 text-lg leading-relaxed">{listing.description}</p>
            </div>

            {/* Vault Story */}
            {listing.isVaultItem && listing.vaultStory && (
              <div className="bg-[#FFD700] bg-opacity-5 border border-[#FFD700] border-opacity-20 rounded-2xl p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Award className="w-5 h-5 text-[#FFD700]" />
                  <h3 className="text-lg font-semibold text-gray-900">Cultural Story</h3>
                </div>
                <p className="text-gray-700">{listing.vaultStory}</p>
              </div>
            )}

            {/* Price and Location */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-bold text-gray-900">₹{listing.price}</span>
                    <span className="text-gray-500">per {listing.priceUnit}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{listing.location}</span>
                </div>
              </div>

              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center space-x-1 text-green-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Available Now</span>
                </div>
                <div className="flex items-center space-x-1 text-[#FFD700]">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Insured</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleBookNow}
                  className="flex-1 bg-[#FFD700] text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  Book Now
                </button>
                <button className="px-6 py-3 border-2 border-[#FFD700] text-[#FFD700] rounded-xl hover:bg-[#FFD700] hover:text-white transition-colors flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Contact</span>
                </button>
              </div>
            </div>

            {/* Owner Info */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Owner</h3>
              <div className="flex items-center space-x-4">
                <img
                  src={listing.ownerAvatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'}
                  alt={listing.ownerName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{listing.ownerName}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-[#FFD700] fill-current" />
                      <span>4.9 rating</span>
                    </div>
                    <span>128 reviews</span>
                  </div>
                </div>
                <Link
                  to="/chat"
                  className="bg-[#FFD700] bg-opacity-10 text-[#FFD700] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#FFD700] hover:text-white transition-colors border border-[#FFD700] border-opacity-20"
                >
                  Message
                </Link>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-6">Reviews</h2>
              <ReviewList reviews={reviews} />
              {canReview && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>
                  <ReviewForm
                    onSubmit={({ rating, comment }) => {
                      if (!user) return;
                      setReviews(prev => [
                        {
                          name: user.name,
                          rating,
                          comment,
                          date: new Date().toLocaleDateString(),
                        },
                        ...prev,
                      ]);
                    }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Payment Modal Overlay */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative max-w-md w-full"
          >
            <button
              onClick={handlePaymentCancel}
              className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <RazorpayPayment
              bookingId={bookingId}
              itemId={id!}
              startDate={bookingDates.startDate}
              endDate={bookingDates.endDate}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;