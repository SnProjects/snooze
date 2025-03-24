# Snooze

Snooze is a real-time communication platform that allows users to create and join servers, chat in channels, and participate in voice calls. It’s built with a modern tech stack, featuring a monorepo architecture using Nx, a NestJS backend, a React frontend, and WebRTC for voice communication. The project aims to provide a seamless and interactive experience for communities to connect and collaborate.

## Features

- **User Authentication**: Register, login, and logout with JWT-based authentication.
- **Servers and Channels**: Create servers, join servers by ID, and manage channels within servers.
- **Real-Time Messaging**: Send and receive messages in channels with real-time updates using WebSockets.
- **Voice Chat**: Join voice channels to communicate with other users via WebRTC, with mute functionality and connection status indicators.
- **Responsive UI**: A clean and intuitive interface built with React and Chakra UI v3.
- **Monorepo Architecture**: Managed with Nx for efficient development and scalability.

## Tech Stack

- **Monorepo**: Nx
- **Backend**: NestJS, Prisma, PostgreSQL, Socket.IO
- **Frontend**: React, TypeScript, Chakra UI v3, Zustand, WebRTC (via `simple-peer`)
- **Real-Time Communication**: Socket.IO for messaging, WebRTC for voice
- **Database**: PostgreSQL
- **Authentication**: JWT

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn**
- **PostgreSQL** (v14 or higher)
- **Git**

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/SnProjects/snooze.git
cd snooze
```bash

### 2. Install Dependencies

Install all dependencies using npm (or yarn if you prefer):

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of the project and add the following environment variables:

```env
# Backend
DATABASE_URL="postgresql://username:password@localhost:5432/snooze?schema=public"
JWT_SECRET="your_jwt_secret"
PORT=3000

# Frontend
REACT_APP_API_URL=http://localhost:3000
REACT_APP_VOICE_HOST=http://localhost:3000
```

- Replace `username`, `password`, and `snooze` with your PostgreSQL credentials and database name.
- Replace `your_jwt_secret` with a secure secret for JWT signing.

### 4. Set Up the Database

Run the Prisma migrations to set up the database schema:

```bash
npx prisma migrate dev --name init
```

Generate the Prisma client:

```bash
npx prisma generate
```

### 5. Run the Application

Start both the backend and frontend in development mode:

```bash
nx run-many --target=serve --projects=backend,frontend --parallel
```

- The backend will run on `http://localhost:3000`.
- The frontend will run on `http://localhost:4200`.

### 6. Access the App

Open your browser and navigate to `http://localhost:4200`. You can register a new account or log in to start using Snooze.

### 7. API Documentation

The backend provides Swagger API documentation. Once the backend is running, visit:

```bash
http://localhost:3000/api
```

## Project Structure

The project is organized as an Nx monorepo with the following structure:

```ts
snooze/
├── apps/
│   ├── backend/              # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/         # Authentication module
│   │   │   ├── servers/      # Server management module
│   │   │   ├── channels/     # Channel management module
│   │   │   ├── messages/     # Message management module
│   │   │   ├── prisma/       # Prisma ORM setup
│   │   │   └── main.ts       # Entry point
│   │   └── prisma/
│   │       └── schema.prisma # Prisma schema
│   └── frontend/             # React frontend
│       ├── src/
│       │   ├── app/          # Main app setup
│       │   ├── components/   # React components (e.g., Chat, ServerSidebar)
│       │   ├── contexts/     # React contexts (e.g., VoiceContext)
│       │   ├── services/     # API and socket services
│       │   ├── stores/       # Zustand stores (e.g., auth, server, message)
│       │   └── shared-types/ # Shared TypeScript types
├── package.json              # Root package.json
└── README.md                 # This file
```

## How to Contribute

We welcome contributions to Snooze! Follow these steps to contribute:

### 1. Fork the Repository

Fork the repository to your GitHub account and clone it to your local machine:

```bash
git clone https://github.com/SnProjects/snooze.git
cd snooze
```

### 2. Create a Feature Branch

Create a new branch for your feature or bug fix:

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes

- Follow the project’s coding style (e.g., use TypeScript, adhere to existing patterns).
- Ensure your changes are well-documented (e.g., update Swagger for backend, add comments for complex logic).
- Write tests if applicable (e.g., for backend services or frontend components).

### 4. Test Your Changes

Run the app to test your changes:

```bash
nx run-many --target=serve --projects=backend,frontend --parallel
```

If you add new database schema changes, update the Prisma schema and run migrations:

```bash
npx prisma migrate dev --name your-migration-name
npx prisma generate
```

### 5. Commit Your Changes

Commit your changes with a descriptive message:

```bash
git add .
git commit -m "feat: add your feature description"
```

### 6. Push to Your Fork

Push your changes to your forked repository:

```bash
git push origin feature/your-feature-name
```

### 7. Create a Pull Request

Go to the original repository on GitHub and create a pull request from your branch. Provide a detailed description of your changes, including:

- What you added or fixed.
- How to test your changes.
- Any relevant screenshots or logs.

### Contribution Guidelines

- Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for commit messages (e.g., `feat:`, `fix:`, `docs:`).
- Ensure your code passes linting and formatting checks (run `npm run lint`).
- Do not introduce breaking changes without discussion.
- Be respectful and collaborative in discussions.

## Available Scripts

- **Start Development**: `nx run-many --target=serve --projects=backend,frontend --parallel`
- **Build**: `nx build backend` or `nx build frontend`
- **Lint**: `npm run lint`
- **Run Migrations**: `npx prisma migrate dev --name migration-name`
- **Generate Prisma Client**: `npx prisma generate`

## Roadmap

Here’s a list of planned features and improvements for Snooze:

- **Server Deletion**: Add the ability to delete servers.
- **Invite Links**: Implement an invite link system for joining servers (e.g., `snooze.com/join/<serverId>`).
- **Server Icons**: Allow users to upload custom icons for servers.
- **Threads**: Add support for threaded conversations within channels.
- **Enhanced Voice UI**: Create a dedicated UI for voice calls, showing participants, mute status, and more.

## Known Issues

- Duplicate socket listeners may be created when switching channels (to be fixed by cleaning up listeners in `useMessageStore`).
- Voice chat may not handle network disconnections gracefully (needs additional error handling).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions or support, please open an issue on GitHub or contact the maintainers at [your-email@example.com].

---

### Changes Made

1. **Updated Repository Link**:
   - Replaced the placeholder repository URL with `https://github.com/SnProjects/snooze.git` in the "Getting Started" and "How to Contribute" sections.

2. **Roadmap Section**:
   - Renamed the "Future Roadmap" section to "Roadmap" for clarity.
   - Kept the list of planned features as they were, since they align with the features we’ve discussed (e.g., server deletion, invite links, server icons, threads, enhanced voice UI).

3. **Contact Section**:
   - Left the placeholder email (`your-email@example.com`). You can replace it with the actual contact email for the maintainers.

---

### Next Steps

- **Verify**: Ensure the `README.md` meets your expectations. If you’d like to add more details (e.g., a "Deployment" section, additional roadmap items, or a "Code of Conduct"), let me know!
- **UI for Voice**: Would you like to add a dedicated UI component to show the voice call status, participants, and controls (e.g., mute, leave)?
- **Features**: Would you like to start working on one of the roadmap items, such as server deletion or invite links?

What would you like to work on next?
