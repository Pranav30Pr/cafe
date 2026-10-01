import React, { useEffect } from 'react';

export const Accessibility: React.FC = () => {
  useEffect(() => {
    document.title = 'Accessibility Statement | Artisan Roast Cafe';
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="border border-cafe-border bg-cafe-surface p-6 sm:p-10 rounded">
        <div className="border-b border-cafe-border pb-6 mb-8">
          <h1 className="text-3xl font-semibold text-cafe-accent tracking-tight mb-2">
            Accessibility Statement
          </h1>
          <p className="text-xs text-cafe-textMuted">
            Last updated: 02 October 2026 | Version: 1.0
          </p>
        </div>

        <div className="space-y-6 text-sm text-cafe-text leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-cafe-accent mb-2">
              1. Our Standard and Commitment
            </h2>
            <p>
              Artisan Roast Cafe is committed to ensuring digital accessibility for people with disabilities. We design and build our website and QR table ordering application to comply with the <strong>Web Content Accessibility Guidelines (WCAG) 2.2 Level AA</strong> standards.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-cafe-accent mb-2">
              2. Implemented Accessibility Measures
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Semantic HTML Landmarks:</strong> Clean header, navigation, main content, and footer regions.</li>
              <li><strong>Keyboard Operability:</strong> The entire ordering flow, kitchen queue, and management views are fully navigable using keyboard alone with logical tab stops.</li>
              <li><strong>Visible Focus Indicators:</strong> High contrast, unbroken 2px focus indicators on all interactive links, buttons, and form inputs.</li>
              <li><strong>Color Contrast:</strong> Verified minimum 4.5:1 text contrast and 3:1 graphical border contrast recorded in our accessibility log.</li>
              <li><strong>Text & Shape Cues:</strong> Dietary indicators (Veg, Non-Veg, Egg) and order status indicators rely on distinct shapes and text labels, never color alone.</li>
              <li><strong>Form Accessibility:</strong> Visible, associated labels on all form controls, explicit autocomplete flags, and inline text error notices linked with ARIA attributes.</li>
              <li><strong>Motion Reduction:</strong> Automatic adherence to user preferences for reduced motion (`prefers-reduced-motion: reduce`) with zero autoplaying video or distracting animations.</li>
              <li><strong>Audio Controls:</strong> Kitchen order alerts include a prominent "Mute sound" toggle and are never the only alert signal.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-cafe-accent mb-2">
              3. Tested Technologies
            </h2>
            <p>
              This website was tested with screen magnification at 200%, standard screen readers, keyboard-only tab navigation, and automated accessibility auditing tools.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-cafe-accent mb-2">
              4. Known Gaps
            </h2>
            <p>
              Client-provided photographs are currently pending submission from the cafe owner; in development mode, these are represented by flat labelled placeholders. Once actual photographs are supplied, descriptive alternative text will be reviewed and verified.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-cafe-accent mb-2">
              5. How to Report Accessibility Barriers
            </h2>
            <p>
              We welcome feedback on the accessibility of our site. If you encounter any barrier, difficulty, or inaccessible element, please let us know:
            </p>
            <div className="mt-3 p-4 bg-cafe-muted border border-cafe-border rounded text-xs space-y-1">
              <p><strong>Email:</strong> [[CLIENT_TO_PROVIDE: grievance email]]</p>
              <p><strong>Phone:</strong> [[CLIENT_TO_PROVIDE: grievance phone]]</p>
              <p><strong>Address:</strong> [[CLIENT_TO_PROVIDE: full address, e.g. Shop 4, Lane 5, Koregaon Park, Pune 411001]]</p>
            </div>
            <p className="mt-2 text-xs text-cafe-textMuted">
              We aim to respond to accessibility reports within 2 business days.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
