# Codebase Documentation: my-mp3

This document provides a comprehensive technical overview of the `my-mp3` application based on the current codebase implementation.

## 1. Project Overview

`my-mp3` is a web application designed to search for, download, and play audio from YouTube. It is built using the **Next.js App Router**, leveraging server-side actions/APIs for fetching video metadata and transcoding audio using `yt-dlp` and `ffmpeg`. It uses **Prisma** to cache track metadata in a PostgreSQL database and saves the downloaded MP3 files locally to serve them statically.

## 2. Technology Stack

- **Framework**: Next.js 15+ (v16.2.6 specified in `package.json` dependencies)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (v4), shadcn/ui components (Radix UI), Lucide React icons
- **Database ORM**: Prisma (v7.8.0) with `@prisma/adapter-pg`
- **Core Dependencies**:
  - `yt-search`: Used to search for YouTube videos.
  - `yt-dlp` (System Dependency): Used to fetch video metadata and download audio streams.
  - `ffmpeg` (System Dependency): Used for on-the-fly audio transcoding.
  - `@supabase/ssr`: Included in `package.json`, suggesting Supabase is utilized for authentication or Postgres hosting (unable to determine authentication implementation details from the current code).
  - `@aws-sdk/client-s3`: Included in dependencies, implying cloud storage integrations were planned or partially implemented, but current core logic relies on local file system (`public/audio/`).

## 3. Project Structure

```text
c:\Users\HP\Desktop\PROJECTS\my-mp3\my-app\
├── app/                  # Next.js App Router (Pages & API Routes)
│   ├── (pages)/          # UI Pages (e.g., search interface)
│   ├── api/              # API endpoints (audio-check, metadata, play, search, stream)
│   ├── components/       # App-specific React components
│   ├── contexts/         # React Context providers (e.g., SearchContext)
│   ├── layout.tsx        # Main application layout (Sidebar, Topbar, Player)
│   └── page.tsx          # Application root page
├── components/           # Reusable UI components (shadcn/ui, layout, player, cards)
│   ├── layout/           # Sidebar, Topbar
│   ├── player/           # MusicPlayer component
│   └── ui/               # Primitive UI components (shadcn)
├── lib/                  # Utilities, Database client, and external service wrappers
│   ├── db/               # Cache handlers and audio DB utilities
│   ├── youtube/          # YouTube interaction utilities (search, metadata, stream)
│   └── prisma.ts         # Prisma client instantiation
├── prisma/               # Database schemas and migrations
│   └── schema.prisma     # Prisma Data Model
├── public/               # Static assets
│   └── audio/            # Downloaded audio files (*.mp3)
├── hooks/                # Custom React hooks (e.g., use-mobile)
└── .env                  # Environment configuration
```

## 4. Database Models (Prisma)

The project utilizes a Postgres database to cache the track metadata and file paths.

### `Track` Model
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `String` | Primary Key. The 11-character YouTube `videoId`. |
| `title` | `String` | Video title. |
| `thumbnail` | `String` | URL to the video's thumbnail image. |
| `views` | `String` | Number of views. |
| `likes` | `String` | Number of likes. |
| `duration` | `String` | Video duration in string format. |
| `filePath` | `String` | Public URL path to the downloaded MP3 file (e.g., `/audio/[id].mp3`). |
| `createdAt` | `DateTime` | Timestamp of when the track was added to the DB. |

## 5. API Routes

### 5.1. `/api/search` (`GET`)
- **Purpose**: Searches YouTube for a given query string.
- **Parameters**: `q` (Query string).
- **Workflow**: Calls `lib/youtube/search.ts` which uses the `yt-search` package. Returns a JSON array of up to 10 video objects (`videoId`, `url`, `title`, `image`, `author`, `timestamp`).

### 5.2. `/api/play` (`GET`)
- **Purpose**: The primary orchestrator for playback.
- **Parameters**: `videoId` (YouTube Video ID).
- **Workflow**:
  1. **Check Cache**: Queries the database to see if the track (`videoId`) already exists. If it does, returns the cached `audioUrl` and `title`.
  2. **Fetch Metadata**: If not cached, it calls `getVideoMetadata` (which runs `yt-dlp --dump-json`) to get video details.
  3. **Extract Audio**: Calls `extractAudioStream` to download the audio locally using `yt-dlp -x --audio-format mp3` into `public/audio/{videoId}.mp3`.
  4. **Save to DB**: Saves the metadata and the local `filePath` (`/audio/{videoId}.mp3`) to the Prisma database.
  5. **Respond**: Returns the local audio URL and metadata as a JSON payload for the client player to consume.

### 5.3. `/api/audio-check` (`GET`)
- **Purpose**: Checks if an audio file already exists locally in the file system.
- **Parameters**: `videoId`.
- **Workflow**: Checks the `public/audio/{videoId}.mp3` path using Node.js `fs.existsSync`. Returns file existence status, path, size, and modified time.

### 5.4. `/api/stream` (`GET`)
- **Purpose**: Streams audio on the fly directly without saving it fully to disk first.
- **Parameters**: `id` (YouTube Video ID).
- **Workflow**: Spawns `yt-dlp` to get the `bestaudio` stream and pipes it into `ffmpeg` to transcode it to a 128kbps MP3 stream. The FFmpeg output stream is wrapped in a web `ReadableStream` and returned directly to the client with chunked transfer encoding.
- **Note**: The exact usage context between `/api/play` (which saves to disk) and `/api/stream` (which streams on-the-fly) is unable to be determined entirely from the backend code without analyzing the frontend player logic, but both capabilities exist.

### 5.5. `/api/metadata` (`GET`)
- **Purpose**: Fetches raw metadata for a YouTube URL or ID.
- **Workflow**: Validates/extracts the 11-character video ID, then securely executes `yt-dlp --no-playlist --dump-json` to retrieve and return metrics (title, duration, views, likes).

## 6. Business Logic & Utilities (`lib/`)

### 6.1. YouTube Utilities (`lib/youtube/`)
- `search.ts`: Wraps `yt-search` and maps the results to a clean frontend interface (`YouTubeVideo`).
- `metadata.ts`: Handles secure ID extraction using regex and spawns `yt-dlp` to extract JSON metadata.
- `stream.ts`: Orchestrates the actual downloading of audio. It creates the `public/audio` directory if missing, executes `yt-dlp` to save the file locally, and generates a Web ReadableStream for potential immediate consumption.

### 6.2. Database Utilities (`lib/db/`)
- `prisma.ts`: Initializes the Prisma client with `@prisma/adapter-pg`, pointing to `process.env.DATABASE_URL`.
- (Other DB utilities like `cache.ts` and `audio.ts` handle caching logic to avoid redundant downloads).

## 7. Frontend Architecture

### 7.1. Global Layout (`app/layout.tsx`)
The application structure consists of:
- **`SearchProvider`**: A React context wrapper that likely manages search state across the app.
- **`SidebarProvider` & `AppSidebar`**: Persistent navigation/sidebar.
- **Main Content Area**: Features a sticky `Topbar` and a scrollable `children` container.
- **`MusicPlayer`**: A persistent audio player component (`@/components/player/MusicPlayer`) docked at the bottom of the layout, ensuring playback continues while navigating different pages.

### 7.2. Components
- **UI Primitives**: Located in `components/ui/`, likely generated by `shadcn/ui` (e.g., buttons, inputs, sliders).
- **Player**: The `MusicPlayer` component handles the actual playback logic, likely interfacing with `/api/play` or `/api/stream` to get audio sources.

## 8. Environment Configuration
Environment variables defined in `.env` include at least:
- `DATABASE_URL`: Connection string for the PostgreSQL database.
- (Additional variables for AWS S3 and Supabase may exist based on package dependencies, but cannot be confirmed without viewing `.env`).

## 9. Workflows

**Search and Play Workflow:**
1. User enters a query in the UI.
2. The UI calls `/api/search?q=[query]`.
3. Results are displayed. User clicks on a track.
4. The Player component triggers `/api/play?videoId=[id]`.
5. The server checks the DB cache.
   - **Cache Hit**: Instantly returns the public URL (`/audio/[id].mp3`).
   - **Cache Miss**: Downloads the audio to `public/audio/` using `yt-dlp`, saves metadata to Prisma, and returns the newly created public URL.
6. The `MusicPlayer` component updates its `src` to the returned URL and begins playback.

## 10. Integrations & Authentication
- **Authentication**: Unable to determine from the current code. While `@supabase/ssr` is installed, no explicit middleware or protected routes were observed in the core backend logic.
- **External Integrations**: Heavily dependent on YouTube (via `yt-dlp` and `yt-search`).
- **Storage**: Currently relies on local disk storage (`public/audio/`). Code comments inside `/api/stream/route.ts` suggest background cloud upload (AWS S3) was prototyped but is currently commented out.

## 11. System Flow

The primary end-to-end flow when a user searches for and plays a track follows these steps:

**Phase 1: Search**
1. The user enters a search query in the Frontend UI.
2. The Frontend makes a `GET` request to `/api/search?q=[query]`.
3. The API queries YouTube via the `yt-search` utility.
4. YouTube returns a list of videos matching the query.
5. The API parses the list into clean JSON results and returns them to the Frontend.

**Phase 2: Playback Request**
1. The user clicks on a specific track in the search results.
2. The Frontend initiates playback by calling `GET /api/play?videoId=[id]`.
3. The `/api/play` orchestrator queries the Postgres Database Cache to check if the track already exists locally.

**Phase 3a: Cache Hit (Track exists)**
1. The Database returns the existing file path.
2. The API immediately returns the cached URL and metadata to the Frontend.

**Phase 3b: Cache Miss (Track is new)**
1. The Database confirms the track is not cached.
2. The API fetches raw metadata from YouTube using `yt-dlp --dump-json`.
3. The API then uses `yt-dlp -x` to download and extract the audio stream.
4. The audio is saved locally to the `public/audio/` directory.
5. The API saves the newly fetched metadata and the generated local file path into the Postgres Database.
6. The API returns the new local URL and metadata to the Frontend.

**Phase 4: Playback Execution**
1. The Frontend's `MusicPlayer` component receives the local audio URL.
2. The player begins streaming the audio file to the user from the local server.
