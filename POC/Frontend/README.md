# Alzheimer Care Dashboard - Frontend

A comprehensive React-based dashboard for managing Alzheimer's disease patients, tracking cognitive assessments, medications, activities, and appointments.

## Features

- **Patient Profile Management**: View detailed patient information including diagnosis and stage
- **Cognitive Progress Tracking**: Interactive charts showing memory, cognitive, and behavioral scores over time
- **Medication Management**: Track active medications with dosage and frequency
- **Activity Logging**: Record daily activities with mood tracking
- **Appointment Scheduling**: Manage upcoming medical appointments
- **Responsive Design**: Mobile-friendly interface with adaptive layouts

## Tech Stack

- **React 18.2**: Modern React with hooks
- **Recharts**: Interactive data visualization
- **Lucide React**: Beautiful icon library
- **Tailwind CSS**: Utility-first CSS framework
- **Custom UI Components**: Reusable component library

## Installation

1. Navigate to the Frontend directory:
```bash
cd ADNI-MULTIMODAL/Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
Frontend/
├── components/
│   └── ui/              # Reusable UI components
│       ├── card.js
│       ├── button.js
│       ├── input.js
│       ├── label.js
│       ├── textarea.js
│       └── select.js
├── public/
│   └── index.html       # HTML template
├── app.js               # Main application component
├── index.js             # Application entry point
├── index.css            # Global styles with Tailwind
├── package.json         # Dependencies and scripts
└── tailwind.config.js   # Tailwind configuration
```

## Components

### UI Components
- **Card**: Container component with header, content, and footer sections
- **Button**: Customizable button with multiple variants
- **Input**: Form input field
- **Label**: Form label component
- **Textarea**: Multi-line text input
- **Select**: Dropdown selection component

### Main Features
- **Dashboard View**: Overview of patient health metrics
- **Patient Profile**: Detailed patient information
- **Cognitive Progress Chart**: Line chart showing assessment trends
- **Recent Activities**: Activity feed with mood tracking

## Customization

### Colors
The application uses a pink and gray color scheme. To customize colors, edit the Tailwind configuration in `tailwind.config.js` or modify the CSS variables in `index.css`.

### Mock Data
Currently uses mock data for demonstration. To connect to a backend API, modify the data fetching logic in `app.js`.

## Future Enhancements

- Backend API integration
- User authentication
- Real-time notifications
- Data export functionality
- Multi-patient management
- Caregiver portal
- Mobile app version

## License

Part of the ADNI-MULTIMODAL project.
