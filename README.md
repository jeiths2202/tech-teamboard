# Tech Support Team Board

> Internal project & issue tracking system for technical support operations

## Stack

```
Next.js 16 · React 19 · TypeScript · Prisma · SQLite · Tailwind CSS · shadcn/ui
```

## Quick Start

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

## Architecture

```
src/
├── app/           # App Router pages & API routes
├── components/    # UI components (shadcn/ui based)
├── lib/
│   ├── db/        # DBIO abstraction layer
│   └── store/     # Zustand state management
└── types/         # TypeScript definitions

prisma/
├── schema.prisma  # Data models
└── seed.ts        # Initial data
```

## Features

- **Dashboard** — Real-time project overview & metrics
- **Kanban Board** — Drag-based workflow management
- **Issue Tracking** — Full CRUD with IMS integration
- **Member Management** — Role-based access control

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:seed` | Seed database |
| `npm run db:migrate` | Run migrations |

## License

MIT
