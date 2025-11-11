# Installation Guide - Alzheimer Care Dashboard

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation Steps

### For Windows Users

If you encounter PowerShell execution policy errors, you have two options:

#### Option 1: Use Command Prompt (Recommended)
1. Open Command Prompt (cmd.exe)
2. Navigate to the Frontend directory:
   ```cmd
   cd c:\Users\abdel\Downloads\alzheimer_project\ADNI-MULTIMODAL\Frontend
   ```
3. Install dependencies:
   ```cmd
   npm install
   ```
4. Start the development server:
   ```cmd
   npm start
   ```

#### Option 2: Adjust PowerShell Execution Policy
1. Open PowerShell as Administrator
2. Run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Then proceed with installation:
   ```powershell
   cd ADNI-MULTIMODAL\Frontend
   npm install
   npm start
   ```

### For Mac/Linux Users

1. Open Terminal
2. Navigate to the Frontend directory:
   ```bash
   cd ~/Downloads/alzheimer_project/ADNI-MULTIMODAL/Frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## What Gets Installed

The following packages will be installed:

### Dependencies
- **react** (^18.2.0) - Core React library
- **react-dom** (^18.2.0) - React DOM rendering
- **react-scripts** (5.0.1) - Create React App scripts
- **recharts** (^2.10.3) - Charting library for cognitive progress visualization
- **lucide-react** (^0.294.0) - Icon library
- **web-vitals** (^2.1.4) - Performance metrics

### Dev Dependencies
- **tailwindcss** (^3.3.0) - Utility-first CSS framework
- **autoprefixer** (^10.4.16) - PostCSS plugin for vendor prefixes
- **postcss** (^8.4.31) - CSS transformation tool

## Verifying Installation

After installation completes, you should see:
- A `node_modules` folder in the Frontend directory
- A `package-lock.json` file

## Running the Application

Once dependencies are installed, start the development server:

```bash
npm start
```

The application will automatically open in your default browser at:
**http://localhost:3000**

## Troubleshooting

### Port 3000 Already in Use
If port 3000 is already in use, you'll be prompted to use a different port. Press 'Y' to accept.

### Module Not Found Errors
If you see module not found errors, try:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Tailwind CSS Not Working
Ensure all configuration files are present:
- `tailwind.config.js`
- `postcss.config.js`
- `index.css` with Tailwind directives

### Build Errors
Clear the cache and rebuild:
```bash
npm run build
```

## Production Build

To create a production-ready build:

```bash
npm run build
```

This creates an optimized build in the `build` folder.

## Additional Commands

- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

## Support

For issues or questions, refer to:
- React documentation: https://react.dev
- Create React App: https://create-react-app.dev
- Tailwind CSS: https://tailwindcss.com
