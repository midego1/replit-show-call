# Show Caller

A comprehensive performance management platform empowering performers and teams with intelligent collaboration and preparation tools, designed for seamless show logistics and team coordination.

## 📱 Features

- **Show Management**: Create and organize shows with start times and descriptions
- **Call System**: Schedule calls at specific times before each show
- **Group Assignment**: Assign calls to specific groups (cast, crew, etc.)
- **Real-time Countdown**: Visual timers for upcoming calls
- **Notification System**: Browser and mobile push notifications when call times are reached
- **Cross-platform**: Web app and native mobile apps for iOS and Android

## 🚀 Technology Stack

### Web Application
- React with TypeScript
- TanStack Query for data fetching
- Shadcn/ui for modern UI components
- Tailwind CSS for responsive design
- PostgreSQL for data persistence
- Passport.js for authentication

### Mobile Application
- React Native with Expo
- Cross-platform support for iOS and Android
- Native notifications
- Offline support

## 🔧 Setup and Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL database

### Installation

1. Clone the repository
```bash
git clone https://github.com/midego1/replit-show-call.git
cd replit-show-call
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file with the following variables:
```
DATABASE_URL=postgresql://username:password@localhost:5432/showcaller
SESSION_SECRET=your_session_secret
```

4. Start the development server
```bash
npm run dev
```

## 📱 Mobile App Setup

1. Navigate to the mobile directory
```bash
cd mobile
```

2. Install dependencies
```bash
npm install
```

3. Start the Expo development server
```bash
npm start
```

4. Use the Expo Go app on your device to scan the QR code and run the app

## 📋 Project Structure

- `/client`: Frontend React application
- `/server`: Backend Express API
- `/shared`: Shared TypeScript types and database schema
- `/mobile`: React Native mobile application
- `/mobile-app`: Alternative structure using Expo Router

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.