import React from 'react';
import { motion } from 'framer-motion';
import ChatHub from '../components/ChatHub';

const ChatHubPage: React.FC = () => {
  return (
    <div className="min-h-screen gradient-bg py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-display font-bold text-circlo-black mb-4">
            Community Chat Hub
          </h1>
          <p className="text-lg text-circlo-black/70 max-w-2xl mx-auto">
            Connect with fellow renters, get support, and join community discussions. 
            Everything you need to communicate is right here.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ChatHub />
        </motion.div>

        {/* Additional Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 grid md:grid-cols-3 gap-6"
        >
          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="font-semibold text-circlo-black mb-2">Real-time Chat</h3>
            <p className="text-sm text-circlo-black/60">
              Instant messaging with other users and support team
            </p>
          </div>

          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="font-semibold text-circlo-black mb-2">Community Groups</h3>
            <p className="text-sm text-circlo-black/60">
              Join interest-based groups and share experiences
            </p>
          </div>

          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🛠️</span>
            </div>
            <h3 className="font-semibold text-circlo-black mb-2">24/7 Support</h3>
            <p className="text-sm text-circlo-black/60">
              Get help anytime with our dedicated support team
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatHubPage;