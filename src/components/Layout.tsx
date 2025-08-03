import React from 'react';
import Header from './Header';
import Footer from './Footer';
import FloatingChat from './FloatingChat';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <FloatingChat />
    </div>
  );
};

export default Layout;