import React, { useState } from 'react';
import { MessageCircle, Users, Settings, Search, Plus, Star, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GlassButton } from './GlassComponents';

interface ChatHubProps {
  className?: string;
}

const ChatHub: React.FC<ChatHubProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('recent');

  const recentChats = [
    {
      id: 1,
      name: 'John Doe',
      lastMessage: 'Thanks for the camera rental!',
      time: '2 min ago',
      unread: 2,
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
      online: true
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      lastMessage: 'Is the bike still available?',
      time: '1h ago',
      unread: 0,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
      online: false
    },
    {
      id: 3,
      name: 'Support Team',
      lastMessage: 'How can we help you today?',
      time: '3h ago',
      unread: 1,
      avatar: '/api/placeholder/50/50',
      online: true
    }
  ];

  if (!user) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg p-8 text-center ${className}`}>
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Join the Conversation</h3>
        <p className="text-gray-600 mb-6">
          Sign in to start chatting with other users and get support from our team.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/login">
            <GlassButton className="bg-gradient-gold text-circlo-black font-semibold">
              Sign In
            </GlassButton>
          </Link>
          <Link to="/register">
            <GlassButton variant="ghost">
              Create Account
            </GlassButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Chat Hub</h2>
            <p className="text-blue-100">Connect with the community</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'recent', label: 'Recent', icon: Clock },
          { id: 'support', label: 'Support', icon: MessageCircle },
          { id: 'community', label: 'Community', icon: Users }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="h-96 overflow-y-auto">
        {activeTab === 'recent' && (
          <div className="divide-y divide-gray-100">
            {recentChats.map((chat, index) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  to={`/chat/${chat.id}`}
                  className="flex items-center p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="relative mr-3">
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 truncate">{chat.name}</h4>
                      <span className="text-sm text-gray-500">{chat.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unread > 0 && (
                    <div className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {chat.unread}
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'support' && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
            <p className="text-gray-600 mb-4">
              Our support team is here to help you with any questions or issues.
            </p>
            <Link to="/chat/support">
              <GlassButton className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                Start Support Chat
              </GlassButton>
            </Link>
          </div>
        )}

        {activeTab === 'community' && (
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Community Groups</h3>
                <button className="text-blue-600 hover:text-blue-700 transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              {[
                { name: 'Camera Enthusiasts', members: 234, icon: '📷' },
                { name: 'Tool Sharing', members: 189, icon: '🔧' },
                { name: 'Event Equipment', members: 156, icon: '🎉' }
              ].map((group, index) => (
                <motion.div
                  key={group.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 text-lg">
                    {group.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{group.name}</h4>
                    <p className="text-sm text-gray-600">{group.members} members</p>
                  </div>
                  <Star className="w-4 h-4 text-gray-400" />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex gap-2">
          <Link to="/chat" className="flex-1">
            <GlassButton 
              className="w-full bg-gradient-gold text-circlo-black font-semibold"
            >
              Direct Messages
            </GlassButton>
          </Link>
          <Link to="/chat/support" className="flex-1">
            <GlassButton 
              variant="ghost"
              className="w-full"
            >
              Get Support
            </GlassButton>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChatHub;