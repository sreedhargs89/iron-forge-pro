# Iron Forge Pro 🏋️

A modern, production-grade gym workout tracker built with Next.js 14, TypeScript, and IndexedDB for offline-first functionality.

![Iron Forge Pro](https://img.shields.io/badge/Iron_Forge-Pro-E63946?style=for-the-badge&logo=github)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

## ✨ Features

### 🎯 Workout Tracking
- **6-Day Push/Pull/Legs Split** - Professionally designed 12-week hypertrophy program
- **Set-by-Set Logging** - Track weight, reps, and rest times for each exercise
- **Rest Timer** - Built-in countdown timer between sets
- **Progressive Overload** - Track your progress week over week

### 📊 Progress Analytics
- **12-Week Overview** - Visual progress tracking for entire program
- **Volume Metrics** - Track total volume (weight × reps) by workout type
- **Weekly Stats** - See completion rates and progress percentages
- **Phase Guidance** - Foundation, Build, and Peak phase coaching

### 📏 Body Measurements
- **Full Body Tracking** - Record all major circumference measurements
- **Weight & Body Fat** - Track changes over time
- **Progress Comparison** - See changes between measurements

### ⚙️ Settings & Customization
- **Unit Preferences** - Switch between kg/lbs and cm/inches
- **Theme Support** - Dark mode optimized
- **Data Export** - Backup your workout data as JSON
- **Reset Options** - Clear all data when needed

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Dexie.js (IndexedDB wrapper)
- **State Management**: Zustand
- **Styling**: CSS Variables + Custom Components
- **Icons**: Lucide React
- **Date Utilities**: date-fns

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/iron-forge-pro.git

# Navigate to project
cd iron-forge-pro

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📱 PWA Support

Iron Forge Pro is PWA-ready! Install it on your phone for the best experience:

1. Open the app in your mobile browser
2. Tap "Add to Home Screen"
3. Enjoy the native app experience

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main dashboard
│   ├── workout/           # Workout tracking
│   ├── progress/          # Progress analytics
│   ├── measurements/      # Body measurements
│   └── settings/          # App settings
├── components/            # React components
│   ├── auth/             # Auth provider
│   ├── layout/           # Layout components
│   └── workout/          # Workout-specific components
└── lib/
    ├── db/               # Dexie database schema
    └── store/            # Zustand stores
```

## 🎨 Design Philosophy

- **Mobile-First**: Designed primarily for gym use on phones
- **Dark Theme**: Easy on the eyes in any lighting
- **Minimal UI**: Get in, log your workout, get out
- **Offline-First**: Works without internet connection

## 📄 License

MIT License - feel free to use this for your own fitness journey!

---

Built with 💪 for serious lifters
