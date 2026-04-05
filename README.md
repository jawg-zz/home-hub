# Home Hub - Smart Home Management Dashboard

A modern smart home management dashboard built with Next.js, Prisma, and PostgreSQL.

## Features

- **Device Management**: Control smart devices (lights, locks, thermostats, etc.)
- **Household Tasks**: Manage shopping lists and chores
- **Energy Monitoring**: Track energy consumption with charts
- **Role-Based Access Control**: Admin, member, and viewer roles
- **Security**: Input sanitization, password validation, rate limiting

## Tech Stack

- **Frontend**: Next.js 16, React 18, Recharts
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (for local PostgreSQL)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the PostgreSQL database:

```bash
docker-compose up -d home-db
```

3. Set up the database:

```bash
npx prisma db push
npm run db:seed  # Optional: seed demo data
```

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Demo Credentials

- Email: demo@home.com
- Password: Demo@123!

## Database Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# PostgreSQL connection (via docker-compose)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/homehub"

NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Generating a Secure Secret

```bash
openssl rand -base64 32
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run TypeScript check
- `npm run test` - Run tests
- `npm run db:seed` - Seed database with demo data

## API Endpoints

### Devices

- `GET /api/devices` - List all devices
- `POST /api/devices` - Create device (admin only)
- `GET /api/devices/[id]` - Get device
- `PATCH /api/devices/[id]` - Update device
- `DELETE /api/devices/[id]` - Delete device (admin only)

### Chores

- `GET /api/chores` - List all chores
- `POST /api/chores` - Create chore (member+)
- `PATCH /api/chores/[id]` - Update chore (member+)
- `DELETE /api/chores/[id]` - Delete chore (member+)

### Shopping

- `GET /api/shopping` - List all items
- `POST /api/shopping` - Create item (member+)
- `PATCH /api/shopping/[id]` - Update item (member+)
- `DELETE /api/shopping/[id]` - Delete item (member+)

## Security Features

- Input sanitization with DOMPurify
- Password validation (min 8 chars, uppercase, lowercase, number, special char)
- Rate limiting on auth endpoints (5 attempts per 15 minutes)
- Role-based access control

## License

MIT
