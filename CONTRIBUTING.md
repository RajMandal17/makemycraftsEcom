# Contributing to MakeMyCrafts

First off, thank you for considering contributing to MakeMyCrafts! It's people like you that make this platform a great tool for artists and art enthusiasts.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (code snippets, screenshots, etc.)
- **Describe the behavior you observed** and what you expected
- **Include your environment details** (OS, Java version, Node version, browser, etc.)

### Suggesting Features

Feature suggestions are welcome! Please:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested feature
- **Explain why this feature would be useful** to most users
- **Include mockups or examples** if applicable

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the code style guidelines** below
3. **Add tests** if you're adding functionality
4. **Ensure all tests pass** before submitting
5. **Update documentation** if needed
6. **Write a clear commit message** following our conventions
7. **Submit your pull request** with a clear description

**Pull Request Checklist:**
- [ ] Code follows the project's style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Documentation updated (if applicable)
- [ ] No new warnings generated
- [ ] Tests added/updated and passing

## Development Setup

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- Node.js 18+ and npm
- MySQL 8.0 or PostgreSQL 12+
- Redis (optional, for caching)

### Backend Setup

```bash
cd backend
cp src/main/resources/application-dev.properties.example src/main/resources/application-dev.properties
# Edit application-dev.properties with your local configuration
./mvnw clean install
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your local configuration
npm run dev
```

### Using Docker (Recommended)

```bash
# Copy environment file
cp .env.example .env
# Edit .env with your configuration

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

See [docs/DOCKER_SETUP.md](docs/DOCKER_SETUP.md) for detailed Docker instructions.

## Code Style Guidelines

### Java (Backend)

- Follow [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- Use meaningful variable and method names
- Keep methods small and focused (Single Responsibility Principle)
- Add Javadoc for public APIs
- Use `@Override` annotation
- Avoid magic numbers, use constants

**Example:**
```java
/**
 * Retrieves artwork by ID with caching support.
 *
 * @param artworkId the unique identifier of the artwork
 * @return the artwork entity
 * @throws ResourceNotFoundException if artwork not found
 */
@Override
@Cacheable(value = "artworks", key = "#artworkId")
public Artwork getArtworkById(Long artworkId) {
    return artworkRepository.findById(artworkId)
        .orElseThrow(() -> new ResourceNotFoundException("Artwork not found"));
}
```

### TypeScript/React (Frontend)

- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use functional components with hooks
- Use TypeScript types/interfaces (avoid `any`)
- Keep components small and reusable
- Use meaningful component and variable names

**Example:**
```typescript
interface ArtworkCardProps {
  artwork: Artwork;
  onSelect?: (id: number) => void;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({ artwork, onSelect }) => {
  // Component implementation
};
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring without changing functionality
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates

### Examples

```
feat(payment): add Razorpay payment gateway integration
fix(auth): resolve OAuth2 redirect issue
docs(readme): update installation instructions
```

## Questions?

Feel free to open an issue with the `question` label.

Thank you for contributing! 🎨
