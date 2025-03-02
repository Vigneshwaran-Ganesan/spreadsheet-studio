
# Spreadsheet Application

A full-stack spreadsheet application built with React, Express, and TypeScript featuring a responsive grid interface with formula support, cell formatting, and data persistence.

## Features

- Interactive spreadsheet grid with resizable rows and columns
- Cell formatting (bold, italic, color, font size)
- Formula support for calculations
- Real-time updates
- Data persistence using PostgreSQL with Drizzle ORM

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI components
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL via Neon Serverless
- **ORM**: Drizzle ORM
- **Tooling**: Vite, ESBuild, TSX

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd <repository-name>
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

The application will be available at http://localhost:5000

## Project Structure

```
├── client/              # Frontend code
│   ├── src/             # React components and hooks
│   └── index.html       # HTML entry point
├── server/              # Backend Express server
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   └── storage.ts       # Database interaction
├── shared/              # Shared code between frontend and backend
│   └── schema.ts        # Database schema and types
└── package.json         # Project dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the application in production mode
- `npm run check` - Type-check the TypeScript code
- `npm run db:push` - Push database schema changes

## Deployment

This application is designed to be deployed on Replit. The build process is configured to bundle both the frontend and backend code.

## License

[MIT](https://choosealicense.com/licenses/mit/)
