# OpenCode Mobile Client

A mobile client for OpenCode that brings AI-powered software engineering to your pocket. Built with React Native and Expo.

## Features

- **Chat Interface** - Conversational interface for interacting with OpenCode's AI agents
- **Session Management** - Create, manage, and resume coding sessions
- **Model Selection** - Choose from multiple AI models and providers
- **Search** - Quickly find models across all providers
- **Cross-Platform** - Runs on iOS and Android

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator (macOS) or Android Emulator
- OpenCode server running (`opencode serve`)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/OpencodeZenbox.git
cd OpencodeZenbox

# Install dependencies
npm install

# Start the development server
npm start
```

### Configuration

Create a `.env` file based on `.env.example`:

```env
EXPO_PUBLIC_API_URL=http://your-server-ip:4096
```

**Important for physical devices:**
- iOS Simulator: Use `http://127.0.0.1:4096`
- Android Emulator: Use `http://10.0.2.2:4096`
- Physical iOS Device: Use your Mac's local IP (e.g., `http://192.168.1.x:4096`)

### Running

```bash
# Start Expo development server
npm start

# Run on iOS Simulator
npm run ios

# Run on Android Emulator
npm run android
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Container.tsx    # Safe area container
│   ├── MessageBubble.tsx # Chat message bubbles
│   └── ModelSelector.tsx # Model/provider picker
├── navigation/          # Navigation setup
│   └── AppNavigation.tsx
├── screens/             # App screens
│   ├── ChatScreen.tsx   # Main chat interface
│   └── SessionListScreen.tsx # Session history
├── services/            # API integration
│   └── api.ts           # OpenCode server API
├── store/               # State management
│   └── chatStore.ts     # Zustand store
└── types/               # TypeScript types
    └── chat.ts          # Type definitions
```

## Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - React Native tooling and platform
- **TypeScript** - Type-safe JavaScript
- **Zustand** - Lightweight state management
- **React Navigation** - Native navigation
- **Axios** - HTTP client

## OpenCode Integration

This app connects to an OpenCode server to provide AI-assisted coding capabilities. Ensure your OpenCode server is running:

```bash
# Start OpenCode server on all interfaces
opencode serve --hostname 0.0.0.0 --port 4096

# Or with authentication
OPENCODE_SERVER_PASSWORD=your-password opencode serve
```

## API Reference

The app uses OpenCode's REST API:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/session` | GET | List all sessions |
| `/session` | POST | Create new session |
| `/session/:id/message` | POST | Send message |
| `/provider` | GET | List providers and models |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [OpenCode](https://opencode.ai) - AI-powered software engineering platform
- [Expo](https://expo.dev) - React Native platform
- [React Native](https://reactnative.dev) - Cross-platform mobile framework
