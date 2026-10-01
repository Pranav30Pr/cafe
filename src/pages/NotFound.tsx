import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/SvgIcon';

export const NotFound: React.FC = () => {
  useEffect(() => {
    document.title = '404 - Page Not Found | Artisan Roast Cafe';
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="border border-cafe-border bg-cafe-surface p-8 sm:p-12 rounded">
        <h1 className="text-3xl font-semibold text-cafe-accent mb-3">
          Page Not Found
        </h1>
        <p className="text-sm text-cafe-textMuted mb-6 leading-relaxed">
          The page or table link you are looking for does not exist or may have been moved.
        </p>
        <Link
          to="/"
          className="touch-target inline-flex items-center gap-2 px-6 py-2.5 bg-cafe-accent text-white font-medium text-sm rounded hover:bg-cafe-accentHover transition-colors duration-150"
        >
          <span>Return to Home</span>
          <Icons.ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
