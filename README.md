# MaximusCommunicator - Local Setup Guide

This guide will help you set up and run the MaximusCommunicator application locally on your machine.

## Project Overview

MaximusCommunicator is a full-stack application with:
- **Frontend**: React with Vite
- **Backend**: Node.js with Express
- **API Integration**: Nous API for chat functionality

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

## Installation

1. Clone the repository (if you haven't already)

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

### Nous API Setup

The application uses the Nous API for normal chat functionality instead of WhatsApp Business. You'll need to configure this:

1. Obtain a Nous API key from [Nous Research](https://nousresearch.com/)

2. Set up your API key in one of two ways:
   
   **Option 1**: Create a `.env` file in the project root with:
   ```
   NOUS_API_KEY=your_api_key_here
   ```

   **Option 2**: Configure it through the application UI after starting the app:
   - Navigate to Settings
   - Enter your Nous API key in the appropriate field

## Running the Application

### Development Mode

To run both the client and server in development mode:

```bash
NODE_ENV=development npm run dev
```

On Windows PowerShell, use:

```powershell
$env:NODE_ENV="development"; npm run dev
```

This will start:
- The Express backend server
- The Vite development server for the React frontend

The application will be available at: http://localhost:5000

### Production Build

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Application Structure

- `/client`: React frontend application
  - `/src`: Source code
    - `/components`: UI components
    - `/hooks`: Custom React hooks
    - `/lib`: Utility functions
    - `/pages`: Page components

- `/server`: Node.js backend
  - `index.ts`: Main server entry point
  - `nous.ts`: Nous API integration
  - `routes.ts`: API routes
  - `storage.ts`: Data storage interface

- `/shared`: Shared code between client and server

## Features

- Chat functionality using Nous API
- Contact management
- Security settings including encryption options
- Form integration

## Troubleshooting

### API Connection Issues

If you experience issues connecting to the Nous API:

1. Verify your API key is correctly set
2. Check the server logs for any error messages
3. Ensure you have internet connectivity

### Development Server Issues

If the development server fails to start:

1. Check if port 5000 is already in use
2. Verify all dependencies are installed correctly
3. Check for any TypeScript compilation errors

## License

MIT