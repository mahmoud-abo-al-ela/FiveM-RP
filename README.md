# FiveM Legacy RP - Community Hub

A modern, feature-rich Next.js web application for FiveM roleplay servers with Discord OAuth authentication, user profiles, events system, leaderboard, and more.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)

## ✨ Features

### 🔐 Authentication
- **Discord OAuth Integration** - Seamless sign-in with Discord
- **User Profiles** - Customizable profiles with Discord integration
- **Role-based Access** - Admin and user role management

### 🎮 Core Features
- **Server Status Dashboard** - Real-time server statistics
- **Events System** - Community events, races, heists, and tournaments
- **Leaderboard** - Multiple categories (playtime, wealth, reputation, level)
- **Store System** - In-game items with shopping cart
- **News & Updates** - Latest server announcements
- **Application System** - Whitelist applications

### 🎨 UI/UX
- **Modern Dark Theme** - Cyberpunk-inspired design
- **Smooth Animations** - Framer Motion powered transitions
- **Responsive Design** - Mobile-first approach
- **Premium Aesthetics** - Glassmorphism and gradient effects

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account ([supabase.com](https://supabase.com))
- A Discord application for OAuth ([discord.com/developers](https://discord.com/developers/applications))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd nextjs-version
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project on Supabase
   - Go to SQL Editor and run the contents of `supabase-schema-updated.sql`
   - Get your project URL and anon key from Settings → API

4. **Set up Discord OAuth**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to OAuth2 → General
   - Add redirect URL: `http://localhost:3000/api/auth/callback/discord`
   - Copy your Client ID and Client Secret

5. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Discord OAuth Configuration
   NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_CLIENT_SECRET=your_discord_client_secret
   # FiveM Server Configuration (Optional)
   FIVEM_SERVER_IP=your_server_ip
   FIVEM_SERVER_PORT=30120
   ```

   **Note:** Discord OAuth is configured in Supabase Dashboard (Authentication > Providers > Discord)

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
nextjs-version/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Auth pages (signin, callback, error)
│   │   │   ├── events/        # Events API
│   │   │   ├── leaderboard/   # Leaderboard API
│   │   │   ├── profile/       # User profile API
│   │   │   └── ...
│   │   ├── events/            # Events page
│   │   ├── leaderboard/       # Leaderboard page
│   │   ├── profile/           # User profile page
│   │   ├── store/             # Store page
│   │   ├── applications/      # Applications page
│   │   └── ...
│   ├── components/            # React components
│   │   ├── layout/           # Layout components
│   │   └── ui/               # UI components (shadcn/ui)
│   ├── lib/                   # Utility libraries
│   │   ├── supabase/         # Supabase clients
│   │   └── utils.ts          # Helper functions
│   └── hooks/                 # Custom React hooks
├── public/                    # Static assets
├── supabase-schema-updated.sql # Database schema
└── package.json
```

## 🗄️ Database Schema

The application uses Supabase with the following main tables:

- **users** - User authentication and Discord data
- **user_profiles** - Extended user profile information
- **events** - Server events and activities
- **leaderboard** - Player rankings and scores
- **store_items** - In-game store inventory
- **shopping_cart** - User shopping carts
- **applications** - Whitelist applications
- **news_articles** - Server news and updates
- **notifications** - User notifications

See `supabase-schema-updated.sql` for the complete schema.

## 🔧 Configuration

### Discord OAuth Setup

1. Go to your Discord application
2. OAuth2 → General
3. Add redirect URLs:
   - Development: `http://localhost:3000/api/auth/callback/discord`
   - Production: `https://yourdomain.com/api/auth/callback/discord`
4. OAuth2 → URL Generator
5. Select scopes: `identify`, `email`, `guilds`

### Supabase Row Level Security (RLS)

The database schema includes RLS policies for security:
- Public can read store items, news, and server status
- Users can manage their own profiles and carts
- Authenticated users can submit applications
- Admins have full access

Adjust policies in `supabase-schema-updated.sql` based on your needs.

## 🎨 Customization

### Theme Colors

Edit `src/app/globals.css` to customize the color scheme:

```css
:root {
  --primary: 262 83% 58%;      /* Purple */
  --secondary: 280 100% 70%;   /* Pink */
  --background: 222 47% 11%;   /* Dark blue */
  /* ... */
}
```

### Server Branding

Update the following files:
- `src/app/layout.tsx` - Meta tags and title
- `src/components/layout/Navbar.tsx` - Server name
- `src/app/page.tsx` - Hero section content

## 📦 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI + shadcn/ui
- **Animations:** Framer Motion
- **Authentication:** Supabase Auth with Discord OAuth
- **Database:** Supabase (PostgreSQL)
- **State Management:** TanStack Query
- **Forms:** React Hook Form + Zod

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Environment Variables for Production

Make sure to update:
- Discord OAuth redirect URL in Supabase Dashboard
- Add production redirect URL in Discord Developer Portal
- Update environment variables for production

## 📝 API Routes

- `GET /api/server-status` - Server status
- `GET /api/news` - News articles
- `GET /api/events` - Upcoming events
- `POST /api/events` - Create event (auth required)
- `GET /api/leaderboard` - Leaderboard data
- `GET /api/profile` - User profile (auth required)
- `PUT /api/profile` - Update profile (auth required)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Open an issue on GitHub
- Join our Discord server
- Check the documentation

## 🎯 Roadmap

- [ ] Real-time notifications
- [ ] Live chat system
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] In-game integration API
- [ ] Payment gateway integration
- [ ] Multi-language support

---

Built with ❤️ for the FiveM community
