import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = false, 
  padding = 'md',
  ...props 
}) => {
  const baseClasses = 'bg-vscode-panel border border-vscode-border rounded-lg';
  
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const cardClasses = `${baseClasses} ${paddings[padding]} ${className}`;

  if (hover) {
    return (
      <motion.div
        whileHover={{ 
          backgroundColor: '#2a2d2e',
          borderColor: '#4f4f4f'
        }}
        transition={{ duration: 0.2 }}
        className={cardClasses}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;