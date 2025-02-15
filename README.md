# Weather Dashboard

A modern dashboard application built with Next.js that provides various widgets including weather forecasts, calendar events, todos, and notes.

## Features

- **Weather Widget**
  - Real-time weather data display
  - Location search by ZIP code
  - Temperature unit toggle (°F/°C)
  - Detailed weather information including temperature, wind, humidity, and pressure
  - Weather forecast visualization

- **Calendar Widget**
  - Event tracking and display
  - Daily and weekly views

- **Todo Widget**
  - Task management
  - Task completion tracking

- **Notes Widget**
  - Quick note-taking functionality
  - Note organization

## Tech Stack

- [Next.js 14](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Environment Setup

1. Clone the repository
2. Create a `.env` file in the root directory with the following variables:
   ```
   OPENWEATHER_API_KEY=your_api_key_here
   ```

### Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
├── app/
│   ├── components/     # React components
│   ├── services/      # API services
│   ├── types/         # TypeScript types
│   └── page.tsx       # Main page
├── components/
│   └── ui/           # Shadcn UI components
├── public/           # Static assets
└── styles/          # Global styles
```

## Development

- The application uses TypeScript for type safety
- Components follow a modular architecture
- Styling is handled through Tailwind CSS
- UI components are built with Shadcn UI

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
