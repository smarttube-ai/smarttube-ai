# SmartTube AI - YouTube Content Creator Assistant

![SmartTube AI Logo](public/logo.png)

SmartTube AI is a comprehensive AI-powered platform designed to help YouTube content creators optimize their channels, generate engaging content, and improve their SEO performance. This application provides a suite of tools to streamline the content creation process and maximize audience engagement.

## 🚀 Features

### Dashboard
- Personalized dashboard with quick access to all tools
- Recent activity tracking
- Channel performance metrics

### Scripting Tool
- AI-powered script generation
- Customizable parameters (title, keywords, audience type, video length, content type)
- Export options (Text/PDF/Docs)

### Ideation Tool
- Channel analysis
- AI-powered video suggestions
- Content trend analysis
- Export functionality

### YouTube Tools
- Video data extraction
- Real-time SEO scoring
- Tag finder
- Auto-summary generator
- Hook generator

### AI SEO Tools
- Title generator
- Description generator
- Thumbnail prompt generator
- Hashtag generator
- Tags generator
- Video chapters generator
- Thumbnail feedback tool

### Analytics
- Channel performance metrics
- Video statistics visualization
- Audience insights
- Growth tracking

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI Components**: Radix UI
- **Styling**: TailwindCSS
- **Authentication**: Supabase
- **State Management**: React Context
- **Animations**: Framer Motion
- **Data Visualization**: Recharts
- **Visual Effects**: TSParticles

## 📋 Prerequisites

- Node.js (v16.0.0 or higher)
- npm or yarn
- Supabase account
- YouTube Data API key

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/smarttube-ai.git
   cd smarttube-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_YOUTUBE_API_KEY=your_youtube_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
smarttube-ai/
├── public/              # Static assets
├── src/
│   ├── components/      # UI components
│   │   ├── landing/     # Landing page components
│   │   └── ui/          # Reusable UI components
│   ├── contexts/        # React contexts
│   ├── lib/             # Utility libraries
│   ├── pages/           # Application routes
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Helper functions
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
├── supabase/            # Supabase functions and migrations
├── .env                 # Environment variables
├── index.html           # HTML entry point
├── package.json         # Project dependencies
├── tailwind.config.js   # TailwindCSS configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## 🚀 Deployment

1. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. The build output will be in the `dist` directory, which can be deployed to any static hosting service like Netlify, Vercel, or GitHub Pages.

## 🧪 Testing

```bash
npm run test
# or
yarn test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email support@smarttubeai.com or join our Discord community.

## 🙏 Acknowledgements

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Supabase](https://supabase.io/)
- [Radix UI](https://www.radix-ui.com/)
- [YouTube Data API](https://developers.google.com/youtube/v3)
