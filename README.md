# Node API Template

- Node
- TypeScript
- Express
- Axios
- Pino
- Zod

To install dependencies:

```bash
npm install
```

To run:

```bash
npm start
```

## Project features

- error handling middleware
- logging middleware using Pino
- validation middleware using Zod
- different routes for different API versions
- controller for each route
- modular design
- fully typed Zod-TypeScript schema

## Axios client features

- Automatic token management (fetching, storing, and refreshing)
- Custom header support through a generator function
- Automatic token renewal before expiration (60-second buffer)
- Request interceptor for ensuring valid tokens on each request
- Response interceptor for handling 401 errors and token refresh
- Automatic request retry after token refresh
- Error handling and logging
- TypeScript support with type definitions
- Configurable base URL for external service
- OAuth 2.0 / OpenID Connect token acquisition
