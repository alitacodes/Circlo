import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

// Glass Card Component
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  onClick 
}) => {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -4 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`glass-card rounded-glass ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

// Glass Button Component
interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false
}) => {
  const baseClasses = 'glass-button rounded-glass font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-circlo-yellow/50';
  
  const variantClasses = {
    primary: 'text-circlo-black hover:bg-circlo-yellow/20',
    secondary: 'text-circlo-yellow border-circlo-yellow/30 hover:bg-circlo-yellow/10',
    ghost: 'text-circlo-black/80 hover:bg-white/20'
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
};

// Glass Input Component
interface GlassInputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  className = ''
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`glass-input rounded-glass px-4 py-3 w-full text-circlo-black placeholder:text-circlo-black/60 focus:outline-none focus:ring-2 focus:ring-circlo-yellow/50 transition-all duration-300 ${className}`}
    />
  );
};

// Floating Glass Badge
interface FloatingBadgeProps {
  children: React.ReactNode;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

export const FloatingBadge: React.FC<FloatingBadgeProps> = ({
  children,
  position = 'top-right',
  className = ''
}) => {
  const positionClasses = {
    'top-left': 'top-3 left-3',
    'top-right': 'top-3 right-3',
    'bottom-left': 'bottom-3 left-3',
    'bottom-right': 'bottom-3 right-3'
  };

  return (
    <div className={`absolute ${positionClasses[position]} glass-card px-3 py-1 rounded-full text-sm font-semibold text-circlo-black ${className}`}>
      {children}
    </div>
  );
};

// Glass Icon Container
interface GlassIconProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
  animate?: boolean;
}

export const GlassIcon: React.FC<GlassIconProps> = ({
  icon: Icon,
  size = 'md',
  color = 'text-circlo-yellow',
  className = '',
  animate = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 p-2',
    md: 'w-6 h-6 p-3',
    lg: 'w-8 h-8 p-4',
    xl: 'w-12 h-12 p-6'
  };

  return (
    <motion.div
      animate={animate ? { rotate: 360 } : {}}
      transition={animate ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
      className={`glass-card rounded-full ${sizeClasses[size]} flex items-center justify-center ${className}`}
    >
      <Icon className={`${color} ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-8 h-8' : 'w-12 h-12'}`} />
    </motion.div>
  );
};

// Glass Stats Counter
interface GlassCounterProps {
  number: string | number;
  label: string;
  icon?: LucideIcon;
  animate?: boolean;
  className?: string;
}

export const GlassCounter: React.FC<GlassCounterProps> = ({
  number,
  label,
  icon: Icon,
  animate = true,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`glass-counter ${className}`}
    >
      {Icon && (
        <motion.div
          animate={animate ? { scale: [1, 1.1, 1] } : {}}
          transition={animate ? { duration: 2, repeat: Infinity } : {}}
          className="mb-3"
        >
          <Icon className="w-8 h-8 text-circlo-yellow mx-auto" />
        </motion.div>
      )}
      <motion.div 
        className="text-3xl font-bold gradient-text mb-2"
        animate={animate ? { textShadow: ['0 0 20px rgba(255,215,0,0.5)', '0 0 30px rgba(255,215,0,0.8)', '0 0 20px rgba(255,215,0,0.5)'] } : {}}
        transition={animate ? { duration: 2, repeat: Infinity } : {}}
      >
        {number}
      </motion.div>
      <div className="text-circlo-black/70 font-medium">{label}</div>
    </motion.div>
  );
};

// Glass Category Tile
interface GlassCategoryTileProps {
  name: string;
  icon: string;
  count: number;
  onClick?: () => void;
  className?: string;
}

export const GlassCategoryTile: React.FC<GlassCategoryTileProps> = ({
  name,
  icon,
  count,
  onClick,
  className = ''
}) => {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.05, 
        rotateY: 5,
        boxShadow: '0 12px 40px 0 rgba(255,215,0,0.15)'
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`category-glass-tile p-6 text-center cursor-pointer ${className}`}
      onClick={onClick}
    >
      <motion.div
        whileHover={{ scale: 1.2, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 400 }}
        className="text-4xl mb-4 group-hover:animate-bounce"
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-semibold text-circlo-black mb-2 group-hover:text-circlo-yellow transition-colors">
        {name}
      </h3>
      <motion.div
        initial={{ opacity: 0.7 }}
        whileHover={{ opacity: 1, scale: 1.05 }}
        className="glass-card px-3 py-1 rounded-full text-sm font-medium text-circlo-black inline-block"
      >
        {count} items
      </motion.div>
    </motion.div>
  );
};

// Orbiting Items Component
interface OrbitingItemsProps {
  items: { icon: string; delay: number }[];
  className?: string;
}

export const OrbitingItems: React.FC<OrbitingItemsProps> = ({ items, className = '' }) => {
  return (
    <div className={`orbit-container ${className}`}>
      {items.map((item, index) => (
        <motion.div
          key={index}
          className="orbit-item text-2xl"
          style={{
            transform: `rotate(${(360 / items.length) * index}deg) translateX(100px) rotate(-${(360 / items.length) * index}deg)`
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
            delay: item.delay
          }}
        >
          <motion.div
            whileHover={{ scale: 1.3 }}
          >
            {item.icon}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

// Glass Loading Spinner
export const GlassSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${sizeClasses[size]} border-2 border-circlo-yellow/30 border-t-circlo-yellow rounded-full`}
    />
  );
};