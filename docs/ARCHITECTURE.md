# MakeMyCrafts Architecture & Design Patterns

This document provides a comprehensive overview of the MakeMyCrafts platform's software architecture, the design patterns employed, and how SOLID principles are applied throughout the codebase.

---

## Table of Contents

1.  [High-Level Architecture](#high-level-architecture)
2.  [Project Structure](#project-structure)
3.  [Design Patterns Applied](#design-patterns-applied)
    *   [Strategy Pattern](#1-strategy-pattern)
    *   [Observer Pattern (Event-Driven)](#2-observer-pattern-event-driven)
    *   [Repository Pattern](#3-repository-pattern)
    *   [Data Transfer Object (DTO) Pattern](#4-data-transfer-object-dto-pattern)
    *   [Builder Pattern](#5-builder-pattern)
    *   [Dependency Injection (IoC)](#6-dependency-injection-ioc)
    *   [Template Method Pattern](#7-template-method-pattern)
    *   [Facade Pattern](#8-facade-pattern)
4.  [SOLID Principles in Action](#solid-principles-in-action)
    *   [Single Responsibility Principle (SRP)](#1-single-responsibility-principle-srp)
    *   [Open/Closed Principle (OCP)](#2-openclosed-principle-ocp)
    *   [Liskov Substitution Principle (LSP)](#3-liskov-substitution-principle-lsp)
    *   [Interface Segregation Principle (ISP)](#4-interface-segregation-principle-isp)
    *   [Dependency Inversion Principle (DIP)](#5-dependency-inversion-principle-dip)
5.  [Frontend Architecture](#frontend-architecture)
6.  [Data Flow Diagram](#data-flow-diagram)
7.  [Security Architecture](#security-architecture)

---

## High-Level Architecture

MakeMyCrafts is a **monolithic application** designed for maintainability and straightforward deployment. While monolithic, it follows a **layered architecture** that could be split into microservices if needed in the future.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                               │
│                    (React 18 + TypeScript + Vite)                       │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                             API GATEWAY                                 │
│            (Spring Boot REST Controllers + Security Filters)            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  JwtAuthenticationFilter │ RateLimitFilter │ CorsFilter          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                 │
│                   (Business Logic & Orchestration)                      │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────────┐   │
│  │ UserService│ │OrderService│ │ArtworkSvc  │ │ PaymentService     │   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         REPOSITORY LAYER                                │
│                    (Data Access Abstraction)                            │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────────────┐   │
│  │UserRepo    │ │ OrderRepo  │ │ArtworkRepo │ │ PaymentRepo        │   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                     │
│              (MySQL 8.0 + Redis Cache + Flyway Migrations)              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

The backend follows a **package-by-feature** approach within a **layered structure**:

```
backend/src/main/java/com/artwork/
├── config/              # Spring configurations (Security, CORS, Redis, WebSocket)
├── controller/          # REST API endpoints (Presentation Layer)
│   ├── admin/           # Admin-specific endpoints
│   ├── artist/          # Artist-specific endpoints
│   └── payment/         # Payment-related endpoints
├── dto/                 # Data Transfer Objects
│   ├── admin/           # Admin DTOs
│   ├── payment/         # Payment DTOs
│   └── websocket/       # WebSocket message DTOs
├── entity/              # JPA Entities (Domain Model)
│   └── payment/         # Payment-related entities
├── event/               # Application Events (for Event-Driven pattern)
│   └── listener/        # Event Listeners
├── exception/           # Custom exceptions and Global Exception Handler
├── filter/              # Servlet Filters (Rate Limiting, etc.)
├── repository/          # Spring Data JPA Repositories
│   └── payment/         # Payment repositories
├── security/            # Security configurations (JWT, OAuth2)
├── service/             # Service Interfaces
│   ├── impl/            # Service Implementations
│   │   ├── admin/       # Admin service implementations
│   │   └── artist/      # Artist service implementations
│   ├── admin/           # Admin service interfaces
│   ├── artist/          # Artist service interfaces
│   ├── ai/              # AI integration (Gemini)
│   ├── email/           # Email templating and sending
│   ├── payment/         # Payment service interfaces
│   │   └── impl/        # Payment implementations (Razorpay)
│   └── websocket/       # WebSocket services
├── util/                # Utility classes (JWT, Helpers)
└── validation/          # Custom validators
```

---

## Design Patterns Applied

### 1. Strategy Pattern

**Where Applied:** `PaymentGateway` interface and its implementations.

The Strategy pattern allows us to define a family of algorithms (payment processing), encapsulate each one, and make them interchangeable. This is critical for supporting multiple payment gateways (Razorpay, Stripe, etc.) in the future.

```
┌──────────────────────────────────────────────────────────────┐
│                     <<interface>>                            │
│                     PaymentGateway                           │
├──────────────────────────────────────────────────────────────┤
│ + createOrder(orderId, amount, currency)                     │
│ + verifyPayment(orderId, paymentId, signature)               │
│ + initiateRefund(paymentId, amount, reason)                  │
│ + getRefundStatus(refundId)                                  │
└──────────────────────────────────────────────────────────────┘
                              ▲
                              │ implements
              ┌───────────────┴───────────────┐
              │                               │
┌─────────────────────────┐     ┌─────────────────────────┐
│   RazorpayGatewayImpl   │     │   StripeGatewayImpl     │
│   (Current)             │     │   (Future)              │
└─────────────────────────┘     └─────────────────────────┘
```

**Code Location:**
- Interface: `service/payment/PaymentGateway.java`
- Implementation: `service/payment/impl/RazorpayGatewayImpl.java`

---

### 2. Observer Pattern (Event-Driven)

**Where Applied:** Email notifications using Spring's `ApplicationEventPublisher`.

Instead of tightly coupling email sending to business logic, we publish events and let listeners handle them asynchronously. This decouples the order processing from email delivery.

```
┌────────────────────┐   publishes    ┌───────────────────┐
│   OrderService     │ ─────────────► │    EmailEvent     │
└────────────────────┘                └───────────────────┘
                                               │
                                               ▼ listened by
                                      ┌───────────────────┐
                                      │ EmailEventListener│
                                      │ (Async Processing)│
                                      └───────────────────┘
                                               │
                                               ▼
                                      ┌───────────────────┐
                                      │   EmailService    │
                                      │   (SendGrid)      │
                                      └───────────────────┘
```

**Code Location:**
- Event: `event/EmailEvent.java`
- Listener: `event/listener/EmailEventListener.java`

---

### 3. Repository Pattern

**Where Applied:** All data access via Spring Data JPA repositories.

Repositories abstract the data layer, providing a clean API to the service layer without exposing database implementation details.

```
┌────────────────────┐          ┌────────────────────────────────────┐
│   ArtworkService   │ ◄──────► │   ArtworkRepository (Interface)   │
│   (Business Logic) │          └────────────────────────────────────┘
└────────────────────┘                         ▲
                                               │ extends JpaRepository
                                    ┌──────────────────────────┐
                                    │    Spring Data JPA       │
                                    │    (Auto-Implementation) │
                                    └──────────────────────────┘
```

**Code Location:** `repository/*.java`

---

### 4. Data Transfer Object (DTO) Pattern

**Where Applied:** All controller and service layer data exchange.

DTOs decouple the internal domain model (Entities) from the external API contract. This prevents sensitive entity fields from leaking and allows independent evolution of API and data models.

```
┌──────────────────┐                   ┌──────────────────┐
│    Controller    │                   │     Client       │
└────────┬─────────┘                   └────────▲─────────┘
         │                                      │
         ▼                                      │
┌──────────────────┐        maps to          ┌──────────────────┐
│    Entity        │ ◄────────────────────── │      DTO         │
│  (Order)         │                         │  (OrderResponse) │
│                  │        maps from        │                  │
│  id, user,       │ ─────────────────────►  │  orderId,        │
│  items, payment  │                         │  totalAmount,    │
│  (has relations) │                         │  status          │
└──────────────────┘                         └──────────────────┘
```

**Code Location:** `dto/*.java`, `dto/admin/*.java`, `dto/payment/*.java`

---

### 5. Builder Pattern

**Where Applied:** Entity and DTO construction using Lombok's `@Builder`.

The Builder pattern simplifies object creation with many optional parameters, improving code readability.

```java
// Example from entity classes
User user = User.builder()
    .username("rajmandal")
    .email("raj@example.com")
    .role(Role.ARTIST)
    .build();
```

**Code Location:** All entities in `entity/*.java` use `@Builder` annotation.

---

### 6. Dependency Injection (IoC)

**Where Applied:** Throughout the application using Spring's `@Autowired` and constructor injection.

Spring manages object creation and wiring, allowing services to depend on abstractions (interfaces) rather than concrete implementations.

```java
// Example: ArtworkServiceImpl depends on interfaces, not implementations
@Service
@RequiredArgsConstructor
public class ArtworkServiceImpl implements ArtworkService {
    private final ArtworkRepository artworkRepository;       // Interface
    private final CloudStorageService cloudStorageService;   // Interface
    private final CategoryService categoryService;           // Interface
}
```

**Code Location:** All `@Service`, `@Controller`, `@Component` classes.

---

### 7. Template Method Pattern

**Where Applied:** Email templating with Thymeleaf.

A base template defines the skeleton of email structure, while specific templates override content sections.

**Code Location:** `resources/templates/email/*.html`

---

### 8. Facade Pattern

**Where Applied:** `HomeService`, `AdminAnalyticsService`.

These services act as facades, providing a simplified interface to multiple underlying services. For example, `HomeService` aggregates data from `ArtworkService`, `ArtistService`, and `CategoryService` for the homepage.

**Code Location:** `service/HomeService.java`, `service/admin/AdminAnalyticsService.java`

---

## SOLID Principles in Action

### 1. Single Responsibility Principle (SRP)

> *A class should have only one reason to change.*

**Examples:**
| Class | Single Responsibility |
|-------|----------------------|
| `JwtUtil` | Token generation and validation only |
| `EmailService` | Sending emails only |
| `ArtworkRepository` | Data access for artworks only |
| `GlobalExceptionHandler` | Centralized error handling only |
| `RateLimitFilter` | Request rate limiting only |

**Code Location:** Each service, controller, and utility class has a focused purpose.

---

### 2. Open/Closed Principle (OCP)

> *Software entities should be open for extension, but closed for modification.*

**Example:** `PaymentGateway` interface.

To add a new payment provider (e.g., Stripe), we create a new implementation without modifying existing code:

```
// Existing code is NOT modified
public interface PaymentGateway { ... }  // Closed for modification

// New code is ADDED
@Service("stripeGateway")                // Open for extension
public class StripeGatewayImpl implements PaymentGateway { ... }
```

**Code Location:** `service/payment/PaymentGateway.java`

---

### 3. Liskov Substitution Principle (LSP)

> *Subtypes must be substitutable for their base types.*

**Example:** All `PaymentGateway` implementations can be used interchangeably. `RazorpayGatewayImpl` can be swapped with a hypothetical `StripeGatewayImpl` without breaking the `PaymentService`.

```java
@Service
public class PaymentServiceImpl {
    private final PaymentGateway paymentGateway;  // Works with ANY implementation
    
    public PaymentServiceImpl(PaymentGateway paymentGateway) {
        this.paymentGateway = paymentGateway;
    }
}
```

---

### 4. Interface Segregation Principle (ISP)

> *Clients should not be forced to depend on interfaces they do not use.*

**Example:** Separate interfaces for different service concerns.

```
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│ CloudStorageService│  │   EmailService    │   │   AuthService     │
├───────────────────┤   ├───────────────────┤   ├───────────────────┤
│ uploadFile()      │   │ sendEmail()       │   │ login()           │
│ deleteFile()      │   │ sendTemplatedEmail│   │ register()        │
└───────────────────┘   └───────────────────┘   └───────────────────┘
```

Instead of one massive "UtilityService" interface, we have small, focused interfaces.

**Code Location:** `service/*.java` - each is a small, focused interface.

---

### 5. Dependency Inversion Principle (DIP)

> *High-level modules should not depend on low-level modules. Both should depend on abstractions.*

**Example:** `ArtworkController` → `ArtworkService` (interface) → `ArtworkServiceImpl` (implementation).

```
┌─────────────────────┐
│  ArtworkController  │ (High-level module)
│  (depends on)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   ArtworkService    │ ◄─── ABSTRACTION (Interface)
│   (interface)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  ArtworkServiceImpl │ (Low-level module)
└─────────────────────┘
```

**Code Location:** Everywhere. Controllers depend on service interfaces, services depend on repository interfaces.

---

## Frontend Architecture

The React frontend follows a **component-based architecture** with clear separation of concerns:

```
frontend/src/
├── api/              # API client functions (Axios wrappers)
├── components/       # Reusable UI components
│   ├── admin/        # Admin dashboard components
│   ├── artwork/      # Artwork display components
│   ├── auth/         # Authentication components
│   ├── common/       # Shared components (Header, Footer)
│   ├── debug/        # Development/debugging components
│   └── ui/           # Base UI components (Button, Modal, Card)
├── config/           # Configuration (API URLs, etc.)
├── context/          # React Context for global state
├── hooks/            # Custom React hooks
├── pages/            # Page-level components (routes)
│   ├── auth/         # Auth pages (Login, Register)
│   └── dashboard/    # Dashboard pages
│       ├── admin/    # Admin dashboard
│       ├── artist/   # Artist dashboard
│       └── customer/ # Customer dashboard
├── services/         # API service abstraction layer
├── styles/           # Global styles and design tokens
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

**Key Frontend Patterns:**
- **Container/Presentational Pattern:** Pages (containers) manage state, components (presentational) render UI.
- **Custom Hooks:** Abstract reusable logic (e.g., `useForm`, `useTheme`).
- **Context API:** Global state management for auth and theme.

---

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                               USER ACTION                                    │
│                          (e.g., Place Order)                                 │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                          REACT FRONTEND                                      │
│  1. User clicks "Checkout"                                                   │
│  2. CartPage.tsx calls paymentAPI.createOrder()                              │
│  3. Opens Razorpay modal                                                     │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │ HTTP POST /api/payment/create
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                       SPRING BOOT BACKEND                                    │
│                                                                              │
│  ┌─────────────────────┐                                                     │
│  │  PaymentController  │ ◄─── Receives Request                               │
│  └──────────┬──────────┘                                                     │
│             │ calls                                                          │
│             ▼                                                                │
│  ┌─────────────────────┐                                                     │
│  │   PaymentService    │ ◄─── Business Logic                                 │
│  └──────────┬──────────┘                                                     │
│             │ uses strategy                                                  │
│             ▼                                                                │
│  ┌─────────────────────┐      ┌────────────────────┐                        │
│  │   PaymentGateway    │ ───► │ RazorpayGatewayImpl│                        │
│  │   (Interface)       │      │ (creates order)    │                        │
│  └─────────────────────┘      └────────────────────┘                        │
│             │                          │                                     │
│             │                          ▼ External API Call                  │
│             │                 ┌────────────────────┐                        │
│             │                 │     RAZORPAY       │                        │
│             │                 │     (3rd Party)    │                        │
│             │                 └────────────────────┘                        │
│             │                                                                │
│             ▼                                                                │
│  ┌─────────────────────┐                                                     │
│  │   OrderRepository   │ ◄─── Saves to DB                                    │
│  └──────────┬──────────┘                                                     │
│             │                                                                │
│             ▼                                                                │
│  ┌─────────────────────┐   publishes   ┌────────────────────┐               │
│  │ ApplicationEvent    │ ────────────► │ EmailEventListener │               │
│  │ Publisher           │               │ (Async)            │               │
│  └─────────────────────┘               └─────────┬──────────┘               │
│                                                  │                          │
│                                                  ▼                          │
│                                        ┌────────────────────┐               │
│                                        │   SendGrid Email   │               │
│                                        └────────────────────┘               │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                                DATABASE                                      │
│                         (MySQL 8.0 + Redis Cache)                            │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          INCOMING REQUEST                                    │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           FILTER CHAIN                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  1. RateLimitFilter       (Prevent DDoS, 100 req/min per IP)           │ │
│  │  2. CorsFilter            (Validate Origin)                            │ │
│  │  3. JwtAuthenticationFilter (Validate JWT, Set SecurityContext)        │ │
│  │  4. CsrfFilter            (Validate CSRF tokens for state-changing)    │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                       AUTHORIZATION (SecurityConfig)                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  - Public Endpoints:    /api/artworks, /api/auth/*, /api/home/*        │ │
│  │  - Customer Only:       /api/cart/*, /api/wishlist/*                   │ │
│  │  - Artist Only:         /api/artist/*, /api/artworks/my-artworks       │ │
│  │  - Admin Only:          /api/admin/*, /api/v1/admin/*                  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           CONTROLLER                                         │
│               (Process request, return response)                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Key Security Features:**
- **JWT Tokens:** Stateless authentication with expiration.
- **OAuth2:** Google login integration.
- **RBAC:** Role-Based Access Control (ADMIN, ARTIST, CUSTOMER).
- **Rate Limiting:** Protects against abuse.
- **CSRF Protection:** For state-changing operations.
- **Password Hashing:** BCrypt for secure password storage.

---

## Summary

| Aspect | Approach |
|--------|----------|
| **Architecture** | Monolithic, Layered (Controller → Service → Repository → Data) |
| **Backend Framework** | Spring Boot 3.2.5, Java 17 |
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Database** | MySQL 8.0 with Flyway Migrations |
| **Caching** | Redis |
| **Primary Design Patterns** | Strategy, Observer, Repository, DTO, Builder, Facade, DI |
| **SOLID Compliance** | Fully Applied (See examples above) |
| **API Style** | RESTful |
| **Authentication** | JWT + OAuth2 (Google) |

---

*This document is maintained alongside the codebase. For implementation details, refer to the source files in the locations mentioned above.*
 

 