# OrbitQuest - Solar System Arcade

A Next.js 14+ arcade game platform featuring 8 planet-themed mini-games with educational content about our solar system.

## 🚀 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Rendering**: Canvas API for games
- **Deployment**: Google Cloud Run
- **Monetization**: Google AdSense

## 🎮 Games

| Planet | Game | Stardust Cost |
|--------|------|---------------|
| Earth | Orbital Defense | Free |
| Mars | Rover Rally | Free |
| Jupiter | Storm Fall | 10,000 |
| Saturn | Ring Runner | 25,000 |
| Venus | Acid Rain | 40,000 |
| Uranus | Ice Breaker | 60,000 |
| Neptune | Deep Dive | 80,000 |
| Mercury | Solar Flare | 100,000 |

## 🛠️ Development

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm run start
```

## 🐳 Docker

### Build Image

```bash
docker build -t orbitquest .
```

### Run Container

```bash
docker run -p 8080:8080 orbitquest
```

## ☁️ Deployment (Google Cloud Run)

### Option 1: Using Cloud Build

```bash
gcloud builds submit --config cloudbuild.yaml
```

### Option 2: Using Deploy Script

```bash
chmod +x deploy.sh
./deploy.sh
```

### Cloud Run Configuration

| Setting | Value |
|---------|-------|
| Region | us-central1 |
| Memory | 256Mi |
| CPU | 0.5 |
| Min Instances | 0 |
| Max Instances | 3 |
| Concurrency | 1 |

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx        # Root layout with fonts
│   ├── page.tsx          # Solar System Hub
│   ├── globals.css       # Design system
│   ├── about/            # About page
│   ├── contact/          # Contact page
│   ├── privacy/          # Privacy Policy
│   ├── terms/            # Terms of Use
│   ├── games/            # Game pages
│   ├── sitemap.ts        # Dynamic sitemap
│   └── robots.ts         # Robots configuration
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── PlanetCard.tsx
│   └── StardustCounter.tsx
└── lib/
    ├── gameTypes.ts      # TypeScript types
    └── localStorage.ts   # Progress manager
```

## 🎨 Design System

```css
/* Colors */
--bg-primary: #050510     /* Deep Navy */
--accent-neon: #00f0ff    /* Neon Cyan */
--text-primary: #e0e0ff   /* Off-White */

/* Fonts */
--font-heading: Orbitron
--font-ui: Rajdhani
--font-body: Inter
```

## 📜 License

© 2026 CoredrivN. All rights reserved.
