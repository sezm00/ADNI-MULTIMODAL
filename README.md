# Brain Analysis Dashboard

A modern, minimalistic Medical Brain Analysis Dashboard built with React, Three.js, and Tailwind CSS.

## Features

- 🧠 Interactive 3D brain model with smooth animations
- 📊 Real-time health metrics (Dopamine, Brain Fluid, Serotonin)
- 📅 Schedule management with appointments
- 🎨 Clean, clinical design with soft blue gradients
- ✨ Smooth micro-interactions and hover effects
- 📱 Responsive layout

## Tech Stack

- **React** - UI library
- **Three.js** - 3D graphics
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for React Three Fiber
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool
- **Lucide React** - Beautiful icon library

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx          # Left navigation sidebar
│   ├── BrainCanvas.jsx      # 3D brain model with Three.js
│   ├── Cards.jsx            # Progress, MRI, and metric cards
│   └── SchedulePanel.jsx    # Right schedule panel
├── App.jsx                  # Main application component
├── main.jsx                 # Application entry point
└── index.css                # Global styles and Tailwind imports
```

## Design Features

### Color Palette
- Primary: Soft blues (#4F8FF7, #7DD3FC)
- Background: White with blue gradient
- Accents: Cyan and green highlights

### UI Components
- **Sidebar**: Icon-based navigation with smooth transitions
- **3D Brain**: Floating, rotating brain model with glow effects
- **Progress Card**: Shows 75% completion with mini chart
- **MRI Widget**: Displays brain scan thumbnails
- **Metrics Cards**: Real-time health data with trend indicators
- **Schedule Panel**: Daily appointments and exercise tracking

### Animations
- Floating brain with breathing effect
- Smooth hover transitions
- Card lift effects
- Auto-rotating 3D model
- Pulsing gradient backgrounds

## Customization

### Colors
Edit `tailwind.config.js` to change the color scheme.

### 3D Model
Modify `src/components/BrainCanvas.jsx` to adjust the brain appearance, rotation speed, or glow effects.

### Layout
Adjust spacing and sizing in `src/App.jsx` and individual components.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
