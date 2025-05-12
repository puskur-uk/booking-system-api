# Appointment Booking Service

A robust backend service for managing medical appointments, built with NestJS and TypeScript.

## Features

- Provider availability management
- Appointment booking and scheduling
- Conflict prevention and resolution
- Event-driven architecture
- Scalable and reliable design

## Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Code Quality**: Biome
- **Containerization**: Docker
- **Testing**: Jest

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- PostgreSQL (if running locally)

## Setup & Installation

1. Set up environment variables:
```bash
touch .env
```

1. Start the development environment:
```bash
docker-compose up
```

## API Documentation

### Provider Management

- `POST /api/providers/:providerId/schedule` - Update provider schedule
- `GET /api/providers/:providerId/availability` - Check provider availability

### Appointment Management

- `POST /api/appointments` - Book new appointment
- `PUT /api/appointments/:appointmentId` - Reschedule appointment
- `DELETE /api/appointments/:appointmentId` - Cancel appointment

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```
