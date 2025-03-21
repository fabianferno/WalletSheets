# Next.js Landing Page with Privy Wallet Integration

This project is a modern landing page built with Next.js, TypeScript, and Tailwind CSS that integrates with Privy for Web3 wallet authentication and management.

## Features

- 🚀 Modern landing page design with responsive layout
- 💻 TypeScript for type safety
- 🎨 Tailwind CSS for styling
- 🔐 Privy wallet integration for Web3 authentication
- 📱 Fully responsive design

## Getting Started

### Prerequisites

- Node.js (v20 or higher recommended)
- Yarn package manager
- A Privy account and API key (get one at [privy.io](https://privy.io))

### Installation

1. Clone the repository or use this template

2. Install dependencies:
   ```
   cd web
   yarn install
   ```

3. Create a `.env.local` file in the root directory with your Privy App ID:
   ```
   NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id-here
   ```

   You can get this from the Privy dashboard after creating an application.

4. Run the development server:
   ```
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `src/app/` - Contains the main pages of the application
- `src/components/` - Reusable UI components
- `src/app/dashboard/` - Protected dashboard page with Privy integration

## Privy Integration

This project uses the Privy SDK for wallet authentication. Some key features:

- Email and wallet-based authentication
- Secure wallet connection
- User profile management
- Seamless onboarding for both crypto-native and new users

## Customization

### Styling

This project uses Tailwind CSS for styling. You can customize the design by:

1. Modifying the theme in `tailwind.config.ts`
2. Updating component styles in their respective files

### Privy Configuration

You can customize the Privy integration by modifying the `PrivyProvider` configuration in `src/app/layout.tsx`.

## Deployment

This Next.js application can be deployed using Vercel, Netlify, or any other platform that supports Next.js.

1. Push your code to a GitHub repository
2. Connect your repository to Vercel/Netlify
3. Make sure to set the `NEXT_PUBLIC_PRIVY_APP_ID` environment variable in your deployment settings

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Privy Documentation](https://docs.privy.io)

## License

This project is licensed under the MIT License.
