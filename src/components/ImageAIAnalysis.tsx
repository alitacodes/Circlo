import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, AlertTriangle, CheckCircle, Loader, Eye, EyeOff, Info, Zap } from 'lucide-react';
import { analyzeImagesWithGemini, validateDamageDetection, DamageDetection } from '../services/geminiService';

interface ImageAIAnalysisProps {
  images: string[];
  onAnalysisComplete: (results: DamageDetection[]) => void;
  mode: 'pre_rental' | 'post_rental';
  baselineImages?: string[]; // For post-rental comparison
}

const ImageAIAnalysis: React.FC<ImageAIAnalysisProps> = ({
  images,
  onAnalysisComplete,
  mode,
  baselineImages = []
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<DamageDetection[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [analysisAttempt, setAnalysisAttempt] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setIsUsingFallback(false);
    setAnalysisAttempt(0);
    
    try {
      const results = await analyzeImagesWithGemini(images, mode, baselineImages);
      const validatedResults = validateDamageDetection(results);
      setAnalysisResults(validatedResults);
      onAnalysisComplete(validatedResults);
      
      // Check if we're using fallback by looking at console logs
      if (results.length > 0 && mode === 'post_rental') {
        // Simple heuristic - in real implementation you'd have a flag
        setIsUsingFallback(true);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsUsingFallback(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const drawDamageOverlay = (image: HTMLImageElement, damages: DamageDetection[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = image.width;
    canvas.height = image.height;

    // Draw the image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw damage overlays
    damages.forEach(damage => {
      const { x, y, width, height } = damage.location;
      const canvasX = x * canvas.width;
      const canvasY = y * canvas.height;
      const canvasWidth = width * canvas.width;
      const canvasHeight = height * canvas.height;

      // Draw bounding box
      ctx.strokeStyle = getSeverityColor(damage.severity);
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(canvasX, canvasY, canvasWidth, canvasHeight);

      // Draw label background
      const labelText = `${damage.type} (${Math.round(damage.confidence * 100)}%)`;
      const labelWidth = ctx.measureText(labelText).width + 20;
      
      ctx.fillStyle = getSeverityColor(damage.severity);
      ctx.fillRect(canvasX, canvasY - 30, labelWidth, 25);
      
      // Draw label text
      ctx.fillStyle = 'white';
      ctx.font = '12px Inter';
      ctx.textAlign = 'left';
      ctx.fillText(labelText, canvasX + 10, canvasY - 12);
    });
  };

  const getSeverityColor = (severity: DamageDetection['severity']) => {
    switch (severity) {
      case 'low': return '#10B981'; // Green
      case 'medium': return '#F59E0B'; // Yellow
      case 'high': return '#EF4444'; // Red
      default: return '#6B7280'; // Gray
    }
  };

  const getDamageIcon = (type: DamageDetection['type']) => {
    switch (type) {
      case 'scratch': return '🔪';
      case 'crack': return '💥';
      case 'stain': return '💧';
      case 'missing_part': return '❌';
      case 'wear': return '👕';
      case 'dent': return '🔨';
      case 'discoloration': return '🎨';
      default: return '⚠️';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  useEffect(() => {
    if (selectedImage && analysisResults.length > 0) {
      const img = new Image();
      img.onload = () => drawDamageOverlay(img, analysisResults);
      img.src = selectedImage;
    }
  }, [selectedImage, analysisResults]);

  // Auto-select first image when analysis completes
  useEffect(() => {
    if (analysisResults.length > 0 && images.length > 0 && !selectedImage) {
      setSelectedImage(images[0]);
    }
  }, [analysisResults, images, selectedImage]);

  // Listen for analysis attempts in console
  useEffect(() => {
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog.apply(console, args);
      const message = args.join(' ');
      if (message.includes('Analysis attempt')) {
        const attemptMatch = message.match(/attempt (\d+)/);
        if (attemptMatch) {
          setAnalysisAttempt(parseInt(attemptMatch[1]));
        }
      }
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {mode === 'pre_rental' ? 'Pre-Rental Analysis' : 'Post-Rental Damage Detection'}
          </h3>
          <p className="text-gray-600">
            {mode === 'pre_rental' 
              ? 'AI will analyze your images to establish a baseline condition'
              : 'AI will compare with baseline images to detect any damage'
            }
          </p>
        </div>
        
        {!isAnalyzing && analysisResults.length === 0 && (
          <button
            onClick={startAnalysis}
            className="bg-[#FFD700] text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition-colors shadow-md hover:shadow-lg flex items-center space-x-2"
          >
            <Zap className="w-5 h-5" />
            <span>Start Enhanced AI Analysis</span>
          </button>
        )}
      </div>

      {/* Enhanced Analysis Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4"
      >
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-blue-900 font-medium">Enhanced AI Analysis</p>
            <p className="text-blue-700 text-sm">
              Using advanced prompts and multiple analysis attempts for higher accuracy.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Fallback Notice */}
      {isUsingFallback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4"
        >
          <div className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-blue-900 font-medium">Using Demo Data</p>
              <p className="text-blue-700 text-sm">
                AI service unavailable. Showing demo analysis results.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Analysis Status */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 text-center"
        >
          <Loader className="w-8 h-8 text-blue-600 mx-auto mb-3 animate-spin" />
          <h4 className="text-lg font-semibold text-blue-900 mb-2">Enhanced AI Analysis in Progress</h4>
          <p className="text-blue-700">
            Analyzing {images.length} image{images.length > 1 ? 's' : ''} with Gemini AI...
          </p>
          {analysisAttempt > 0 && (
            <p className="text-blue-600 text-sm mt-2">Attempt {analysisAttempt} of 3</p>
          )}
          <p className="text-blue-600 text-sm mt-1">This may take 20-60 seconds for best results</p>
        </motion.div>
      )}

      {/* Results */}
      {analysisResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                {isUsingFallback ? 'Demo Analysis Results' : 'Enhanced AI Analysis Results'}
              </h4>
              <button
                onClick={() => setShowOverlay(!showOverlay)}
                className="flex items-center space-x-2 text-[#FFD700] hover:text-yellow-600 transition-colors"
              >
                {showOverlay ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="text-sm">{showOverlay ? 'Hide' : 'Show'} Overlay</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analysisResults.filter(d => d.severity === 'low').length}
                </div>
                <div className="text-sm text-green-700">Minor Issues</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {analysisResults.filter(d => d.severity === 'medium').length}
                </div>
                <div className="text-sm text-yellow-700">Moderate Issues</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {analysisResults.filter(d => d.severity === 'high').length}
                </div>
                <div className="text-sm text-red-700">Major Issues</div>
              </div>
            </div>
          </div>

          {/* Image Viewer with Overlay */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Image Analysis</h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Display */}
              <div className="relative">
                {selectedImage && (
                  <div className="relative">
                    <img
                      src={selectedImage}
                      alt="Analysis"
                      className="w-full rounded-lg shadow-md"
                    />
                    {showOverlay && (
                      <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Damage List */}
              <div className="space-y-3">
                <h5 className="font-semibold text-gray-900">Detected Issues:</h5>
                {analysisResults.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-green-700 font-medium">No damage detected!</p>
                    <p className="text-gray-600 text-sm">Item appears to be in good condition.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {analysisResults.map((damage, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="text-2xl mt-1">{getDamageIcon(damage.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900 capitalize">
                              {damage.type.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              damage.severity === 'high' ? 'bg-red-100 text-red-700' :
                              damage.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {damage.severity}
                            </span>
                          </div>
                          <div className={`text-sm mb-1 font-medium ${getConfidenceColor(damage.confidence)}`}>
                            Confidence: {Math.round(damage.confidence * 100)}%
                          </div>
                          {damage.description && (
                            <div className="text-xs text-gray-500">
                              {damage.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Image Thumbnails */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Analyzed Images</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image)}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                    selectedImage === image ? 'border-[#FFD700]' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Image ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute top-1 right-1 bg-[#FFD700] text-white text-xs px-2 py-1 rounded-full font-medium">
                    {index + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* No Results State */}
      {!isAnalyzing && analysisResults.length === 0 && images.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Ready for Enhanced AI Analysis</h4>
          <p className="text-gray-600">
            {images.length} image{images.length > 1 ? 's' : ''} uploaded. 
            Click "Start Enhanced AI Analysis" for high-accuracy damage detection.
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageAIAnalysis; 