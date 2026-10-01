import React, { useEffect } from 'react';

export const About: React.FC = () => {
  useEffect(() => {
    document.title = 'About Us | Artisan Roast Cafe';
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="border border-cafe-border bg-cafe-surface p-6 sm:p-10 rounded">
        <h1 className="text-3xl font-semibold text-cafe-accent tracking-tight mb-6">
          About Artisan Roast Cafe
        </h1>

        {/* Section 5.1 & Section 0.1: Only text supplied by client */}
        <div className="prose text-cafe-text text-base leading-relaxed space-y-4">
          <p>
            [[CLIENT_TO_PROVIDE: official about us story and cafe background]]
          </p>
          <p className="text-sm text-cafe-textMuted pt-4 border-t border-cafe-border">
            Note: All business descriptions and statements are published strictly as provided by the cafe management.
          </p>
        </div>
      </div>
    </div>
  );
};
