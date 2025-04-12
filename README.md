## Tech Stack

### Frontend
- **Web**: Next.js
- **Mobile**: React Native
- **UI Components**: Shared component library with Tailwind CSS

### Backend
- **API**: Nest.js (TypeScript)
- **Database**: PostgreSQL with pgvector for similarity search
- **Authentication**: NextAuth.js with Solana wallet integration
- **Real-time Communication**: Socket.io

### Blockchain
- **Network**: Solana
- **Smart Contracts**: Anchor framework for Solana Programs
- **Escrow System**: Custom implementation for secure transactions

### Search
- **Full-text Search**: PostgreSQL full-text search
- **Vector Search**: pgvector for similarity search

## Project Structure

```
breakout/
├── apps/                      # Application code
│   ├── api/                   # Nest.js backend API
│   ├── web/                   # Next.js web application
│   └── mobile/                # React Native mobile app
├── packages/                  # Shared packages
│   ├── config/                # Shared configuration presets
│   ├── types/                 # Shared TypeScript types
│   ├── ui/                    # Shared UI components
│   └── utils/                 # Shared utility functions
├── blockchain/                # Blockchain code
│   ├── app/                   # Anchor client app
│   ├── programs/              # Solana programs (smart contracts)
│   └── tests/                 # Blockchain tests
└── infrastructure/            # Infrastructure code
    ├── database/              # Database migrations and seeds
    ├── docker/                # Docker configurations
    └── kubernetes/            # Kubernetes configurations
```

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Solana CLI tools
- Anchor CLI

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/breakout.git
   cd breakout
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   cp apps/mobile/.env.example apps/mobile/.env
   ```

4. Start the database:
   ```bash
   npm run db:migrate
   ```

5. Start the development servers:
   ```bash
   # Start all services
   npm run dev
   
   # Or start individual services
   npm run api:dev
   npm run web:dev
   npm run mobile:dev
   ```

### Blockchain Development

1. Build the Solana program:
   ```bash
   npm run blockchain:build
   ```

2. Test the Solana program:
   ```bash
   npm run blockchain:test
   ```

3. Deploy the Solana program:
   ```bash
   npm run blockchain:deploy
   ```

## Deployment

### Docker

The project includes Docker configurations for all services. To build and run the Docker containers:

```bash
docker-compose up -d
```

### Kubernetes

Kubernetes configurations are provided for production deployments:

```bash
kubectl apply -f infrastructure/kubernetes/
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
