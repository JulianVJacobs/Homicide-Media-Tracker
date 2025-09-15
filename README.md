# Homicide Media Tracker - Desktop Application

A data collection and analysis tool for tracking homicide cases from media sources. This application uses **Next.js Standalone + Electron** architecture to provide both powerful web development experience and native desktop capabilities.

## Purpose

The Homicide Media Tracker is designed for research teams to:
- **Collect Data**: Capture homicide cases from media articles with structured data entry
- **Detect Duplicates**: Identify duplicate cases across different sources automatically  
- **Manage Users**: Support multi-user research teams with role-based access
- **Sync Data**: Work offline with local database, sync with external PostgreSQL server
- **Analyze Patterns**: Process and visualize homicide data for research insights

## Architecture - Next.js Standalone + Electron

This application combines the best of web and desktop development:

### Why This Architecture?
- **Next.js Standalone**: Provides server-side capabilities (API routes, database connections, complex data processing)
- **Electron Wrapper**: Enables native desktop features (file system access, offline work, system integration)
- **Local + Remote Database**: SQLite/LibSQL for offline work, PostgreSQL for team collaboration

### Architecture Diagram
```
Development Mode:
┌─────────────────┐    ┌─────────────────┐
│   Electron      │───▶│   Next.js       │
│   Main Process  │    │   Dev Server    │
│   (port mgmt)   │    │   (port 3000)   │
└─────────────────┘    └─────────────────┘

Production Mode:
┌─────────────────┐    ┌─────────────────┐
│   Electron      │───▶│   Next.js       │
│   Main Process  │    │   Standalone    │
│   (spawns node) │    │   Server        │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│ BrowserWindow   │───▶│ localhost:PORT  │
│ (Desktop UI)    │    │ (dynamic port)  │
└─────────────────┘    └─────────────────┘
```

### Data Flow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React UI      │───▶│   API Routes    │───▶│ Local Database  │
│ (Next.js pages) │    │ (app/api/*)     │    │ (SQLite/LibSQL) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  Data Processing│◄───│  Sync Service   │
                       │ (Duplicate Det.)│    │ (Local ↔ Remote)│
                       └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │External Database│
                                              │   (PostgreSQL)  │
                                              └─────────────────┘
```

## Development

### Prerequisites
- Node.js (18+ recommended)
- npm or yarn
- For external database: PostgreSQL

### Development Workflow
```bash
# Install dependencies
npm install

# Start Next.js development server (port 3000)
npm run dev

# Start Electron in development (in another terminal)
npm run dev:electron

# Or start both concurrently
npm start
```

### Development Mode Details
- **Next.js Dev Server**: Runs on `localhost:3000` with hot module replacement
- **Electron Process**: Points to the dev server, enables desktop features
- **Database**: Uses local SQLite/LibSQL file for development
- **API Routes**: Available at `localhost:3000/api/*` for data processing

## Production Build

### Building for Distribution
```bash
# 1. Build Next.js standalone server
npm run build

# 2. Build Electron main process
npm run build:electron  

# 3. Package desktop application
npm run package
```

### Production Mode Details
- **Next.js Standalone**: Self-contained server with all dependencies
- **Dynamic Port**: Electron finds available port and spawns Next.js server
- **Bundled Database**: Local SQLite file packaged with application
- **External Sync**: Connects to PostgreSQL when network available

## Key Files & Directories

### Next.js Application
- `app/` - Next.js App Router pages and layouts
- `app/api/` - Server-side API routes for data processing
  - `app/api/homicides/` - Homicide case management
  - `app/api/articles/` - Article processing and duplicate detection  
  - `app/api/sync/` - Database synchronization logic
  - `app/api/admin/` - User management and administration
- `components/` - Shared React components
- `lib/` - Database connections and utility functions

### Electron Integration  
- `src/main/main.ts` - Electron main process (spawns Next.js server)
- `src/main/preload.ts` - Secure IPC bridge between main and renderer
- `src/main/util.ts` - Electron utilities (port finding, server management)

### Build Outputs
- `.next/standalone/` - Next.js standalone server build
- `release/` - Electron distribution packages

## Database Architecture

### Local Database (SQLite/LibSQL)
```sql
-- Core tables for homicide data collection
homicides         -- Main homicide cases
articles          -- Media articles and sources  
users             -- User management
sync_status       -- Synchronization tracking
```

### API Routes Structure
```
app/api/
├── homicides/
│   ├── create.ts     -- Add new homicide cases
│   ├── duplicate.ts  -- Detect duplicate cases
│   └── list.ts       -- Query and filter cases
├── articles/
│   ├── process.ts    -- Process article data
│   └── generate-id.ts -- Generate unique article IDs
├── sync/
│   ├── upload.ts     -- Push local data to external server
│   └── download.ts   -- Pull updates from external server
└── admin/
    ├── users.ts      -- User management
    └── database.ts   -- Database administration
```

## Features & Capabilities

### Desktop-Specific Features
- **Offline Operation**: Full functionality without internet connection
- **File System Access**: Import/export data files, backup databases
- **Native Integration**: System notifications, custom menus, auto-updater
- **Multi-Window Support**: Separate windows for different workflows
- **Background Processing**: Data sync and analysis without UI blocking

### Research Data Features  
- **Article Processing**: Generate unique IDs from URL, author, and title
- **Duplicate Detection**: Server-side algorithms to identify duplicate cases
- **Multi-User Collaboration**: Shared PostgreSQL database with user management
- **Data Validation**: Ensure data quality for research integrity
- **Export Capabilities**: Generate reports and datasets for analysis

### Synchronization Features
- **Bidirectional Sync**: Local SQLite ↔ External PostgreSQL  
- **Conflict Resolution**: Handle concurrent data entry by multiple users
- **Offline Queue**: Store changes locally when offline, sync when connected
- **Version Control**: Track data changes and maintain audit trails

## Development Notes

### Next.js Configuration
```javascript
// next.config.js - Required for standalone output
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['electron', 'sqlite3']
  }
}
```

### Environment Variables
```bash
# Development
NODE_ENV=development
DATABASE_URL=./local.db

# Production  
NODE_ENV=production
DATABASE_URL=./app-data.db
EXTERNAL_DB_URL=postgresql://user:pass@server/db
```

## Dependencies

### Core Technologies
- **Next.js 14** - Full-stack React framework with App Router
- **React 18** - UI library with modern hooks and server components  
- **TypeScript** - Type safety across client and server code
- **Electron 31** - Desktop application wrapper

### Styling & UI
- **TailwindCSS** - Utility-first CSS framework
- **Bootstrap 5.3** - Component library and responsive grid
- **React-Bootstrap** - React components for Bootstrap
- **Chart.js + react-chartjs-2** - Data visualization

### Data & Backend
- **sqlite3** or **libsql** - Local database for offline storage
- **pg** - PostgreSQL client for external database connectivity
- **axios** - HTTP client for API requests
- **uuid** - Generate unique identifiers for cases and articles

### Development Tools
- **concurrently** - Run multiple npm scripts simultaneously  
- **wait-on** - Wait for services to be available before proceeding
- **electron-builder** - Package and distribute Electron applications

## Getting Started

1. **Clone and Install**
   ```bash
   git clone <repository>
   cd client
   npm install
   ```

2. **Development**
   ```bash
   npm start  # Starts both Next.js and Electron
   ```

3. **Build and Package**
   ```bash
   npm run build
   npm run package
   ```

This architecture provides the research team with a powerful, offline-capable desktop application while maintaining the excellent developer experience of modern web development.
