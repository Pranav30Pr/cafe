import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/SvgIcon';

export const Home: React.FC = () => {
  useEffect(() => {
    document.title = 'Artisan Roast Cafe';
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      {/* Header section with factual content per Section 5.1 */}
      <div className="border border-cafe-border bg-cafe-surface p-6 sm:p-10 rounded">
        <h1 className="text-3xl sm:text-4xl font-semibold text-cafe-accent tracking-tight mb-4">
          Artisan Roast Cafe
        </h1>

        {/* Factual line from client per Section 5.1 */}
        <p className="text-base sm:text-lg text-cafe-text mb-8 leading-relaxed">
          [[CLIENT_TO_PROVIDE: one line describing the cafe]]
        </p>

        {/* Primary Call to Action */}
        <div className="mb-10 flex flex-wrap gap-4">
          <Link
            to="/menu"
            className="touch-target inline-flex items-center gap-2 px-6 py-3 bg-cafe-accent text-white font-medium text-sm rounded hover:bg-cafe-accentHover transition-colors duration-150"
          >
            <span>View Full Menu</span>
            <Icons.ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/contact"
            className="touch-target inline-flex items-center gap-2 px-6 py-3 bg-cafe-surface text-cafe-text border border-cafe-border font-medium text-sm rounded hover:bg-cafe-muted transition-colors duration-150"
          >
            <span>Find Us & Contact</span>
          </Link>
        </div>

        {/* Essential Information Grid: Hours, Location, Contact */}
        <div className="pt-8 border-t border-cafe-border grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-semibold text-cafe-text uppercase tracking-wider mb-2 flex items-center gap-2">
              <Icons.Clock className="w-4 h-4 text-cafe-accent" />
              <span>Opening Hours</span>
            </h2>
            <p className="text-sm text-cafe-textMuted leading-relaxed">
              Monday to Friday: 8:00 AM to 10:00 PM<br />
              Saturday and Sunday: 8:00 AM to 11:00 PM
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-cafe-text uppercase tracking-wider mb-2 flex items-center gap-2">
              <Icons.MapPin className="w-4 h-4 text-cafe-accent" />
              <span>Address</span>
            </h2>
            <p className="text-sm text-cafe-textMuted leading-relaxed">
              [[CLIENT_TO_PROVIDE: full address, e.g. Shop 4, Lane 5, Koregaon Park, Pune 411001]]
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
