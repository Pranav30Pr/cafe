# Meeva Greens — Design System & Tokens (DESIGN.md)

---

## 1. Aesthetic Identity: Botanical Elegance

The visual identity of **Meeva Greens** reflects fresh organic vitality, tranquility, and artisanal mastery. The interface must feel like an exquisite bespoke native application, free from generic templates.

- **Atmosphere**: Earthy, warm, mindful, luxurious yet accessible.
- **Micro-Interactions**: Fluid spring physics, tactile touch responses, seamless sheet transitions.
- **Surfaces**: Layered frosted glass (`backdrop-blur`), subtle inner borders, soft natural drop shadows.

---

## 2. Design Tokens & Color Palette

### Primary Palette (Earthy & Botanical)
- **Forest Canopy (Brand Primary)**: `#1B382B` (Deep evergreen, authoritative, organic)
- **Sage Herbal (Brand Accent)**: `#4E7A63` (Soft botanical green for badges, highlights)
- **Pistachio Glow (Active State)**: `#8EBA9D` (Lighter tint for active toggles, counters)
- **Ember Terracotta (Call-to-Action)**: `#C4623F` (Warm baked clay for primary buttons, alerts)
- **Golden Oat (Subtle Accent)**: `#D99B52` (Warm honey for chef recommendations & ratings)

### Neutral & Surface Foundation
- **Morning Mist (Light Canvas)**: `#FBF9F4` (Warm off-white cream background)
- **Sandstone Card (Surface 1)**: `#FFFFFF` (Pure white for raised cards)
- **Oatmeal Muted (Surface 2)**: `#F3EFE6` (Contrasting category chips & bottom sheets)
- **Deep Slate (Primary Text)**: `#151E19` (High contrast, softer than pure black)
- **Moss Charcoal (Secondary Text)**: `#55635B` (Muted metadata, descriptions)
- **Subtle Line (Borders)**: `#E6E1D5` (Soft border dividers)

### Semantic & Status
- **Success / Veg Marker**: `#2D8A4E` (Emerald green dot in square)
- **Non-Veg Marker**: `#C44A3F` (Crimson red dot in triangle)
- **Vegan Marker**: `#4E8A63` (Green leaf badge)
- **Urgent / Live Pulse**: `#E0533C` (Kitchen ticket timer alert)

---

## 3. Typography Hierarchy

- **Heading Display**: Modern Serif with Editorial Character (e.g., *Playfair Display* or *Cinzel* / *Italiana* styling via Google Fonts).
- **Interface & Body**: Refined, legible Neo-Grotesque Sans (e.g., *Plus Jakarta Sans* or *Outfit*).
- **Monospace (Numbers / Invoices)**: *JetBrains Mono* / tabular numbers for pricing and tokens.

---

## 4. Mobile Customer App Shell Principles

1. **Native Feel over Web Page**:
   - `100dvh` (Dynamic Viewport Height) containment with safe-area insets (`env(safe-area-inset-bottom)`).
   - Horizontal scrolling category pill bar with snapping and active underline indicator.
   - Fixed Bottom Cart Dock that rises smoothly upon first item addition.
2. **Sheet Overload Elimination**:
   - Bottom drawers for item customizers with swipe-to-dismiss gesture.
   - Zero pop-up browser alert dialogs; all confirmations use in-app micro-toasts.
3. **Skeleton Loading**:
   - Shimmer wave skeletons mirroring actual item card layouts during network calls.

---

## 5. Kitchen Display System (KDS) Principles

1. **High Contrast Glanceability**:
   - Dark theme foundation (`#101613`) to eliminate glare in bright kitchen environments.
   - Massive ticket numbers (`#104`) visible from 3 meters away.
   - Elapsed timer badges with color stages:
     - 0 – 10 mins: Soft Green
     - 10 – 20 mins: Amber Warning
     - 20+ mins: Pulsing Terracotta Alert
2. **Hardware Resilience**:
   - Audio chime status icon (indicates whether browser audio is primed or muted).
   - Device Wake Lock status dot (ensures screen will not sleep mid-shift).
