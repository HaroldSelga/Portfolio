# AAL Group Milktea Supplies ERP

Enterprise resource planning platform for AAL Group's milktea supplies, retail, warehouse, HR, finance, manufacturing, logistics, and customer operations. The system consolidates every operational domain of the business into a single, role-aware platform built for real-world handoffs between teams, branches, and customers.

---

## Table of Contents

- [Overview](#overview)
- [Core Portals](#core-portals)
- [Business Modules](#business-modules)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Third-Party Integrations](#third-party-integrations)
- [Project Structure](#project-structure)
- [Developer Setup](#developer-setup)
- [Deployment](#deployment)
- [Testing](#testing)
- [License](#license)

---

## Overview

AAL Group Milktea Supplies ERP serves as the operational backbone of a supply, retail, and manufacturing business. It unifies product catalog management, procurement, stock movement, branch selling, employee attendance, production runs, delivery tracking, customer ordering, accounting, and service workflows under one platform.

The system is organized around five purpose-built portals that correspond to distinct user roles and operational contexts:

| Domain | What It Covers |
|---|---|
| Operations and Administration | Role-based dashboards, approval workflows, audit logs, announcements, document templates, and system settings |
| Human Resources and Payroll | Employee lifecycle, attendance, shifts, leave, overtime, recruitment, incidents, payroll processing, and payslips |
| Catalog and Inventory | Products, variants, attribute sets, volume pricing, stock ledger, transfers, warehouse bins, pallets, and barcode workflows |
| Sales, POS, and Order Management | End-to-end order pipeline, retail terminal sessions, discounts, receipts, customer returns, installments, and scheduled orders |
| Procurement and Manufacturing | Suppliers, purchase orders, receiving reports, recipes, production requests, production runs, relabeling, and print jobs |
| Finance and Accounting | Sales invoices, accounts receivable, wallets, general ledger, supplier payments, payroll, contributions, and compliance reporting |
| Logistics and Delivery | Dispatch center, Lalamove integration, internal delivery bookings, fleet management, geolocation, and delivery zones |
| Customer Experience | B2B storefront, order tracking, subscriptions, custom design studio, support chat, and wishlist management |
| AI and Communication | AI chat agent, chatbot configuration, intent management, internal chat, real-time presence, and WebRTC signaling |

---

## Core Portals

| Portal | Audience | Primary Capabilities |
|---|---|---|
| Admin | Owners, managers, HR, accounting, warehouse, sales, support, and branch staff | Full ERP suite covering all modules, dashboards, approvals, reporting, documents, audit trail, and settings |
| Employee | Internal employees | Attendance clock-in and clock-out, HR self-service, leave and overtime requests, payslips, documents, daily tasks, and profile management |
| Customer | B2B account holders | Order history, order tracking, subscriptions, design studio, support chat, inquiries, wishlist, and account settings |
| Store | Public and B2B buyers | Product browsing, cart, checkout, and payment gateway flow |
| POS | Branch cashiers and retail managers | Sales terminal, shift sessions, discounts, cash counting, held orders, returns, receipts, Z-readings, and branch stock requests |

---

## Business Modules

### Administration and System Management

- Role-based access control with custom roles, granular permissions, and module-level access gates.
- System-wide settings, company settings, and branch-level configuration.
- Audit trail powered by activity logging across all sensitive operations.
- Announcements, company events, and operational document templates.
- Digital signatories, approval workflows, and document generation.
- Owner profile management with organization structure support.

### Human Resources

- Full employee lifecycle from onboarding to clearance and offboarding.
- Department and position management with salary tiers, shift assignments, and schedules.
- HR calendar covering holidays, events, and workforce availability.
- Recruitment pipeline with applicant tracking, interviews, and manpower request approvals.
- Incident report management with multi-party review flows.
- OJT profiling with daily logs and competency evaluations.
- Performance evaluations tied to position competencies.
- Locker assignment and asset tracking with maintenance logs.
- Employee document management with contract records and digital copies.
- Absence warnings and correction workflows.

### Attendance and Payroll

- Clock-in and clock-out with break tracking and optional face recognition for biometric verification.
- Attendance correction requests and import workflows for bulk attendance data.
- Leave management with balance tracking, leave types, and multi-step approvals.
- Overtime, official business, allowance, and supply requisition filing.
- Holiday duty assignments with differential pay support.
- Payroll period management with automated payroll processing per employee.
- Payslip generation with government contributions (SSS, PhilHealth, Pag-IBIG), deductions, and net pay computation.
- Payroll settings for rates, cutoff schedules, and contribution tables.
- Finance reports for statutory compliance.

### Catalog and Product Management

- Item master with brands, categories, flavors, colors, and classifications.
- Item variants with dynamic attribute sets, attribute definitions, and option values.
- Volume pricing tiers, cost history, and unit of measure management.
- Item serial tracking and batch management.
- Catalog browsing and product interest tracking for customer demand signals.

### Inventory and Warehouse

- Stock ledger with full movement history across all branches and warehouses.
- Stock adjustments, stock transfers between locations, and branch replenishment requests.
- Stock conversions with line-item tracking and reason logging.
- Repackaging requests and repackaging logs.
- Inventory audits with item-level discrepancy recording.
- Inventory batch management with expiry and batch-level stock visibility.
- Warehouse zone and bin management with zone type classification.
- Pallet management with pallet type configuration for organized bulk handling.
- Barcode-driven workflows for receiving, picking, and stock movement.

### Procurement

- Supplier profiles with contact management and payment tracking.
- Purchase order creation with line items, approval flows, and document generation.
- Receiving report management linked to purchase orders with line-level receiving.
- Supplier bills and supplier payment recording.
- Multi-step approval chains for procurement actions.

### Manufacturing

- Recipe and bill of materials management with ingredient-level cost data.
- Production request pipeline from draft through approval and fulfillment.
- Production runs with material consumption tracking and batch output recording.
- Manufacturing pipeline view for end-to-end production visibility.
- Manufacturing inventory management for raw materials and finished goods.
- Print job management with print designs, brand design catalog, and consumable tracking.
- Ink consumption analysis for print cost monitoring.
- Relabeling pipeline for rebranding and product conversion workflows.
- Customer cup inventory management for custom packaging fulfillment.
- Packaging logs for material usage and production records.

### Sales, Orders, and Customer Management

- End-to-end order workflow covering draft, confirmation, preparation, packing, dispatch, delivery, and completion.
- Order release scanning with barcode-driven fulfillment verification.
- Customer profiles with category classification and purchase history.
- Customer-specific discounts and discount items with approval requirements.
- Installment contracts with payment schedules and contract management.
- Scheduled and recurring orders for regular B2B supply customers.
- Customer returns with return line items and refund processing.
- Sales commissions and sales targets linked to employee performance.
- Customer heatmap with geolocation-based demand visualization.
- Marketplace management for external shop listings across platforms.
- Waybill print output for order fulfillment and dispatch.
- Voucher and promotion management.

### Point of Sale

- Full retail terminal with session management, login, and shift handoff.
- Transaction processing with line items, discounts, payment recording, and receipt generation.
- Cash denomination counting for opening and closing float management.
- Held orders for deferred transaction handling.
- POS return and void workflows with electronic journal logging.
- Discount request pipeline with manager approval flows.
- Shift pipeline and shift log tracking.
- Z-reading generation for end-of-shift settlement.
- Sales dashboard, CSR reports, and on-shelf stock visibility for branch staff.
- Terminal and device management with branch-level configuration.

### Finance and Accounting

- Sales invoice management with accounts receivable tracking.
- Customer payments with wallet top-up and wallet transaction history.
- Company expense recording and expense categorization.
- Supplier payments linked to procurement workflows.
- Chart of accounts management and general ledger entry recording.
- Branch-level tax configuration.
- Payment settings for gateway configuration and accepted payment methods.
- Finance reports for period-based revenue, expense, and compliance summaries.

### Logistics and Delivery

- Dispatch dashboard with real-time order assignment and status tracking.
- Lalamove API integration for third-party on-demand delivery booking.
- External delivery management with driver assignment and delivery status.
- Shipping fee requests and fee approval workflows.
- Fleet management with vehicle records, maintenance logs, and assignment tracking.
- Fleet heatmap for geolocation-based delivery density visualization.
- Delivery bookings calendar for scheduled dispatch planning.
- Delivery zones tied to geolocation data for zone-based pricing and routing.

### Service and Warranties

- Service order management covering intake, findings, parts used, and resolution.
- Service order images and finding records for documentation.
- Customer warranty registration and warranty validity tracking.
- Technician profiles with specialization and assignment records.
- Service settings for workflow configuration.

### AI, Chat, and Communication

- AI chat agent powered by an OpenAI-compatible service with session memory.
- Chatbot settings and intent management for configuring automated response flows.
- Local chatbot service as a fallback inference layer.
- Internal chat with real-time presence and message delivery.
- Customer support chat integrated into the customer portal.
- WebRTC signaling support for voice and video call capabilities.
- Laravel Echo with Pusher-compatible channels for live event delivery across all portals.

### E-Commerce and Customer Storefront

- Product catalog storefront with search, filtering, and product detail pages.
- Shopping cart, saved carts, and full checkout flow.
- PayMongo payment gateway integration for online order payments.
- Custom design studio for customers to create branded cup and packaging designs.
- Design gallery and design management for saved customer artwork.
- Order tracking with real-time delivery status and map view.
- Subscriptions management for recurring product delivery.
- Wishlist and product interest management.
- Customer support chat and inquiry submission from the customer portal.

### Documents and Assets

- Document templates with configurable fields and PDF export support.
- Employment documents, invoice PDFs, purchase order documents, waybills, and receiving reports.
- Digital signature capture and signatory assignment for document approval.
- Company asset registry with assignment records and maintenance history.
- Clearance workflows for offboarding and asset recovery.

### Marketing

- Marketing design request management for campaign and material creation.

---

## System Architecture

```text
Browser
  React 19 + TypeScript + Inertia.js + Tailwind CSS 4 + Radix UI
        |
        | HTTPS / WebSocket (Laravel Echo + Pusher protocol)
        v
Laravel 12 Application
  Controllers organized by portal and domain
  Policies and Middleware for authorization and access control
  Services for payroll, approvals, documents, stock, wallets, AI, and delivery
  Jobs and Listeners for queue-driven async processing
  Observers for model lifecycle automation
  Eloquent Models grouped by: Core, Catalog, Inventory, HR, Sales, POS,
    Finance, Procurement, Manufacturing, Logistics, Service, Customer,
    Marketing, Geo, Setup, and Chat
        |
        | SQL / Queue / Broadcast / Storage
        v
PostgreSQL        Laravel Queues       Laravel Reverb
(primary DB)      (async processing)   (WebSocket server)
                                              |
                                    Cloudflare R2 (file storage)
                                    via AWS S3-compatible SDK
```

Optional supporting services:

- Face Recognition Service (FastAPI/Uvicorn, Python) for biometric attendance
- PayMongo for online payment processing
- Lalamove API for third-party delivery
- OpenAI-compatible AI service for chat agent and chatbot workflows
- TikTok Shop, Shopee, and Lazada for marketplace sync
- J&T Express and LBC Express for courier integrations
- Cloudflare Tunnel for secure external access

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| PHP | 8.2+ | Application runtime |
| Laravel | 12 | Framework, routing, queues, events, policies, and Eloquent ORM |
| Inertia.js | 2 | Server-driven SPA bridge between Laravel and React |
| PostgreSQL | — | Primary relational database |
| Laravel Reverb | 1.8+ | WebSocket server for real-time broadcasts |
| Laravel Sanctum | 4 | API token-based authentication |
| Laravel Breeze | 2 | Authentication scaffolding |
| Spatie Activity Log | 4 | System-wide audit trail |
| barryvdh/laravel-dompdf | — | PDF document export |
| PhpSpreadsheet | 5 | Excel and spreadsheet export |
| Intervention Image | 3 | Server-side image processing |
| Flysystem AWS S3 | 3 | Cloudflare R2 file storage via S3-compatible SDK |
| Ziggy | 2 | Laravel named routes exposed to JavaScript |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI component framework |
| TypeScript | 5 | Typed frontend development |
| Vite | 7 | Frontend build system and development server |
| Tailwind CSS | 4 | Utility-first styling system |
| Radix UI | — | Accessible, unstyled headless UI primitives |
| Lucide React | — | Consistent icon library |
| Framer Motion | 12 | Declarative animations and transitions |
| Recharts | 2 | Dashboard charts and data visualization |
| TanStack Table | 8 | Feature-rich data table with sorting, filtering, and pagination |
| FullCalendar | 6 | Calendar views for HR and scheduling modules |
| Tiptap | 3 | Rich text editing for documents and announcements |
| Leaflet / React Leaflet | — | Maps, geolocation overlays, and delivery zone visualization |
| Turf.js | 7 | Geospatial analysis for zone and heatmap computations |
| dnd-kit | — | Drag-and-drop interactions for pipeline and layout management |
| @vladmandic/face-api | — | Client-side face detection and recognition for attendance |
| Sonner | 2 | Toast notification system |
| cmdk | — | Command palette interface |
| date-fns / dayjs | — | Date manipulation and formatting |
| react-barcode | — | Barcode rendering for item and order labels |
| react-signature-canvas | — | Digital signature capture |
| next-themes | — | Light/dark theme switching |
| html2canvas | — | Client-side screenshot capture |

### Supporting Services

| Service | Purpose |
|---|---|
| Face Recognition Service | FastAPI/Uvicorn Python microservice for biometric attendance capture and matching |
| Dockerfile | Production container build with PHP-FPM, Nginx, Supervisor, queue workers, and Reverb |
| Cloudflare Tunnel | Secure external access without port forwarding |

---

## Third-Party Integrations

| Integration | Purpose | Environment Prefix |
|---|---|---|
| OpenAI-compatible AI | AI agent, chatbot inference, and session memory | `SERVICES_AI_*` |
| PayMongo | Online payment gateway for customer orders | `PAYMONGO_*` |
| Lalamove | On-demand delivery booking and tracking | `LALAMOVE_*` |
| TikTok Shop | Marketplace order and inventory sync | `TIKTOK_*` |
| Shopee | Marketplace order and inventory sync | `SHOPEE_*` |
| Lazada | Marketplace order and inventory sync | `LAZADA_*` |
| J&T Express | Courier label and tracking integration | `JNT_*` |
| LBC Express | Courier label and tracking integration | `LBC_*` |
| Cloudflare R2 | File and media storage via S3-compatible API | `AWS_*` / `FILESYSTEM_DISK` |
| Cloudflare Tunnel | Secure external tunnel for production access | `CLOUDFLARE_*` |

---

## Project Structure

```text
app/
  Http/
    Controllers/          Controllers organized by portal and domain
      Admin/              Admin-facing module controllers
      Employee/           Employee self-service controllers
      Customer/           Customer portal controllers
      HR/                 Human resources module controllers
      Finance/            Finance and accounting controllers
      Inventory/          Inventory and warehouse controllers
      Logistics/          Logistics and delivery controllers
      Manufacturing/      Manufacturing and production controllers
      Procurement/        Supplier and purchasing controllers
      Retail/             POS and retail branch controllers
      Sales/              Order and customer management controllers
      Chat/               Real-time chat and messaging controllers
      Api/                API and webhook endpoints
  Models/
    Core/                 Users, roles, permissions, settings, documents, announcements
    Catalog/              Items, variants, attributes, pricing, brands, categories
    Inventory/            Stock ledger, transfers, adjustments, batches, warehouse
    HR/                   Employees, attendance, payroll, leave, shifts, recruitment
    Sales/                Orders, customers, discounts, returns, commissions
    POS/                  Sessions, transactions, terminals, shift logs, Z-readings
    Finance/              Invoices, payments, wallets, general ledger, accounts
    Procurement/          Suppliers, purchase orders, receiving reports, bills
    Manufacturing/        Recipes, production, print jobs, relabeling, packaging
    Logistics/            Deliveries, vehicles, shipping fees
    Service/              Service orders, warranties, technicians
    Customer/             Saved carts, product interests
    Marketing/            Design requests
    Chat/                 Agent sessions, messages, memory
    Geo/                  Locations, zones, regions, barangays
    Setup/                Onboarding and initial configuration models
  Services/
    PayrollEngineService.php      Automated payroll computation
    StockLedgerService.php        Stock movement recording
    WalletLedgerService.php       Customer wallet transaction handling
    DocumentExportService.php     PDF and document generation
    ApprovalChainService.php      Multi-step approval orchestration
    LalamoveApiService.php        Lalamove delivery API integration
    PayMongoService.php           PayMongo payment gateway integration
    AIAgentService.php            OpenAI-compatible AI agent interface
    LocalChatBotService.php       Local fallback chatbot inference
    AttendanceImportService.php   Bulk attendance data import and processing
    NotificationService.php       System-wide notification dispatch
    CapacityGuardService.php      Production capacity enforcement
    EmailOtpService.php           Email OTP generation and verification

resources/
  js/
    Pages/
      Admin/              Admin portal pages organized by module
        HR/               Attendance, payroll, employees, shifts, leave, recruitment
        Sales/            Order workflow, customers, discounts, marketplace
        Finance/          Invoices, wallets, ledger, expenses, reports
        Logistics/        Dispatch, fleet, deliveries, heatmap
        Manufacturing/    Production, recipes, print jobs, relabeling
        Inventory/        Stock management, warehouse, audits
        Retail/           POS terminal, sessions, dashboard, reports
        Procurement/      Suppliers, purchase orders, receiving
        ChatBot/          AI chatbot settings and intent management
        Settings/         System and branch configuration
        Support/          Customer support and CSR tools
        Assets/           Company assets and assignments
        Lockers/          Locker management
      Employee/           Employee self-service portal
      Customer/           Customer account portal with design studio and tracking
      Store/              Public-facing storefront and checkout
      HR/                 Standalone HR views
      Auth/               Login, registration, and authentication flows
      Profile/            User profile management
    Components/           Shared React components and domain-specific UI
    Layouts/              Portal layouts for Admin, Customer, and application shell

database/
  migrations/             Schema definitions for all modules
  seeders/                Reference data and module bootstrap seeders
  factories/              Model factories for development and testing

routes/
  web.php                 Primary web application routes
  api.php                 API, webhook, and external integration routes
  auth.php                Authentication routes
  channels.php            Laravel broadcast channel definitions

face-service/
  app.py                  Face recognition FastAPI microservice
  start.sh                Linux and macOS service launcher
  start.bat               Windows service launcher

Dockerfile                Production container build definition
```

---

## Developer Setup

### Prerequisites

| Requirement | Minimum Version |
|---|---|
| PHP | 8.2 |
| Composer | 2 |
| Node.js | 20 |
| PostgreSQL | 14 |
| Python | 3.9 (optional, for face recognition) |

### Initial Setup

```bash
composer setup
```

This command installs Composer dependencies, creates `.env` from `.env.example` if it does not exist, generates the application key, runs all database migrations, installs Node dependencies, and builds the frontend assets.

### Local Development

```bash
# Start the full development stack:
# Laravel server, queue listener, Vite dev server, and Reverb WebSocket server
composer dev

# Start the full stack with the optional face recognition service
composer dev:with-face-ai

# Start only the Vite frontend dev server
npm run dev
```

### Frontend Build

```bash
npm run build
```

### Optional Face Recognition Service

The face recognition microservice is used by HR attendance features that support biometric capture and face matching. It runs as a separate Python process and communicates with the Laravel application over a local HTTP endpoint.

```bash
# Linux and macOS
bash face-service/start.sh

# Windows
face-service\start.bat
```

---

## Deployment

The repository includes a `Dockerfile` for production container builds. The image compiles Composer dependencies without dev packages, builds Vite frontend assets, configures PHP-FPM and Nginx, runs Laravel optimizations, and starts queue workers and Laravel Reverb under Supervisor.

```bash
docker build -t aal-milktea-erp .
docker run --env-file .env -p 8000:80 aal-milktea-erp
```

The production environment requires configured values for the following categories:

- Database connection (PostgreSQL)
- Application key and URL
- Laravel Reverb host, port, and application credentials
- Queue connection and driver
- Mail driver and credentials
- File storage (Cloudflare R2 via AWS S3-compatible configuration)
- PayMongo keys for payment processing
- Lalamove API credentials for delivery
- OpenAI-compatible endpoint and key for AI features
- Marketplace API credentials for TikTok Shop, Shopee, and Lazada
- Courier credentials for J&T Express and LBC Express
- Cloudflare Tunnel token if external access is required

---

## Testing

```bash
composer test
```

This clears the application configuration cache and runs the full PHPUnit test suite. To run tests directly through Artisan:

```bash
php artisan test
php artisan test --filter=ExampleTest
```

---

## License

MIT License.
