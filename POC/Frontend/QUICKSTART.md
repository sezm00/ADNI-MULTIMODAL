# Quick Start Guide 🚀

Get the Alzheimer Care Dashboard running in 3 simple steps!

## Prerequisites Check ✓

Make sure you have Node.js installed:
```bash
node --version
```
Should show v14 or higher.

## Installation (Choose Your Method)

### Windows Users - Command Prompt (Recommended)

1. **Open Command Prompt** (Press `Win + R`, type `cmd`, press Enter)

2. **Navigate to Frontend folder:**
   ```cmd
   cd c:\Users\abdel\Downloads\alzheimer_project\ADNI-MULTIMODAL\Frontend
   ```

3. **Install dependencies:**
   ```cmd
   npm install
   ```
   ⏱️ This takes 2-3 minutes

4. **Start the app:**
   ```cmd
   npm start
   ```
   🎉 Browser opens automatically at http://localhost:3000

### Mac/Linux Users - Terminal

1. **Open Terminal**

2. **Navigate to Frontend folder:**
   ```bash
   cd ~/Downloads/alzheimer_project/ADNI-MULTIMODAL/Frontend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the app:**
   ```bash
   npm start
   ```

## What You'll See 👀

Once running, you'll see the **AlzCare Plus Dashboard** with:

- 📊 **Memory Score Card** - Latest cognitive assessment (68/100)
- 💊 **Active Medications** - Current prescriptions (2)
- 🏃 **Activities Today** - Completed activities
- 📅 **Next Appointment** - Upcoming doctor visits

Plus:
- 👤 Patient profile for Margaret Thompson
- 📈 Interactive cognitive progress chart
- 📝 Recent activities feed with mood tracking

## Troubleshooting 🔧

### "npm is not recognized"
- Install Node.js from https://nodejs.org

### Port 3000 already in use
- Press `Y` when prompted to use a different port

### PowerShell execution policy error
- Use Command Prompt instead (see above)
- OR see INSTALLATION.md for PowerShell fix

### Module not found errors
```bash
rm -rf node_modules package-lock.json
npm install
```

## What's Next? 🎯

### Explore the Dashboard
- Click around the interface
- Check the cognitive progress chart
- View patient activities
- See upcoming appointments

### Customize
- Edit `app.js` to modify functionality
- Update `index.css` for styling changes
- Add new components in `components/ui/`

### Connect to Backend
- Replace mock data with API calls
- Add authentication
- Implement data persistence

## Key Files 📁

```
Frontend/
├── app.js              ← Main application
├── index.js            ← Entry point
├── components/ui/      ← Reusable components
├── package.json        ← Dependencies
└── README.md          ← Full documentation
```

## Commands Reference 📝

| Command | Purpose |
|---------|---------|
| `npm start` | Start development server |
| `npm run build` | Create production build |
| `npm test` | Run tests |

## Need Help? 💬

- 📖 Read **README.md** for detailed documentation
- 🔧 Check **INSTALLATION.md** for installation issues
- 📋 See **IMPLEMENTATION_SUMMARY.md** for technical details

## Features Included ✨

✅ Patient profile management
✅ Cognitive assessment tracking
✅ Medication management
✅ Activity logging with mood tracking
✅ Appointment scheduling
✅ Interactive data visualization
✅ Responsive mobile design
✅ Modern UI with Tailwind CSS

---

**Ready to go?** Just run `npm install` then `npm start`! 🎉
