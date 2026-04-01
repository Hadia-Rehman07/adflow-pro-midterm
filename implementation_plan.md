# AdFlow Pro - Implementation Plan

AdFlow Pro is an advanced moderated ads marketplace where clients submit paid listings, moderators review content, administrators verify payments, and approved ads go live for a package-based duration.

## Goal Description

Build a full-stack Next.js web application implementing the AdFlow Pro specifications. The system will encompass a public browsing interface, client dashboard, moderator queue, and full-featured administration panel.

## Proposed Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS + Shadcn UI (for premium aesthetic, animations, and accessible components)
- **Database & Auth**: Supabase (PostgreSQL) + Supabase Auth
- **Validation**: Zod
- **Form Handling**: React Hook Form
- **Icons**: Lucide React
- **Hosting / Automation**: Vercel (Serverless Functions + Vercel Cron Jobs)

## Database Core Entities (Supabase Postgres)

The core tables will be mapped to Supabase Postgres. We'll use public schema tables and potentially Row Level Security (RLS) for access control, combined with user roles.

- `users`: Extends Supabase `auth.users` with `role` (Client, Moderator, Admin, Super Admin), `status`, `name`.
- `seller_profiles`: `user_id`, `display_name`, `business_name`, `phone`, `city`, `is_verified`.
- `packages`: `id`, `name`, `duration_days`, `weight`, `is_featured`, `price`.
- `categories`: `id`, `name`, `slug`, `is_active`.
- `cities`: `id`, `name`, `slug`, `is_active`.
- `ads`: `id`, `user_id`, `package_id`, `title`, `slug`, `category_id`, `city_id`, `description`, `status`, `publish_at`, `expire_at`.
- `ad_media`: `ad_id`, `source_type`, `original_url`, `thumbnail_url`, `validation_status`.
- `payments`: `ad_id`, `amount`, `method`, `transaction_ref`, `sender_name`, `screenshot_url`, `status`.
- `ad_status_history`: `ad_id`, `previous_status`, `new_status`, `changed_by`, `note`, `changed_at`.
- `notifications`, `audit_logs`, `learning_questions`, `system_health_logs`.

## Workflow & State Machine

Ads will strictly follow this state machine:
`Draft` → `Under Review` → `Payment Pending` → `Payment Submitted` → `Payment Verified` → `Scheduled` → `Published` → `Expired` → `Archived`.

> [!TIP]
> Each transition will trigger a database trigger or API action to insert an `ad_status_history` record, ensuring strict traceability.

## Proposed Changes / Phases

### Phase 1: Foundation & Supabase DB Setup
- Initialize Next.js project with Tailwind CSS.
- Setup Supabase Auth, roles, and schema definition (using SQL migrations).
- Implement initial Navigation, Footer, and Landing Page layout.

### Phase 2: User Roles & Dashboards
- Implement Auth flow (Register, Login).
- Create RBAC (Role-Based Access Control) utility for Server and Client.
- Scaffold layouts for `Client Dashboard`, `Moderator Dashboard`, `Admin Dashboard`.

### Phase 3: Ad Workflow & Client Experience
- Client Ad Form and media normalization logic.
- Submission to Review queue.
- Payment submission stage.

### Phase 4: Moderation & Admin Actions
- Moderator reviewing interface.
- Admin payment verification interface.
- Publishing queue and ad state machine completion.

### Phase 5: Public Search & Categories
- Setup Home Page with featured ads and proper ranking logic.
- Implement Explore Ads (search, filters, category/city taxonomy).
- Build the Ad details page with media preview.

### Phase 6: Automation & Analytics
- Configure Vercel Cron routes for scheduling publishes and expiries.
- Build Admin Analytics Dashboard with KPIs and Charts.

## User Review Required

> [!IMPORTANT]
> **Supabase Project Creation**: This application requires a Supabase project. I can write the database migration scripts, but you will need to create a project on Supabase and provide the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and `SUPABASE_SERVICE_ROLE_KEY` for admin actions). 
> **Are you ready to create a Supabase project and provide the keys once the application is scaffolded?**

## Open Questions

1. **Supabase Schema Management**: Should I create standard `.sql` files in a `supabase/migrations` folder so you can apply them locally or via the Supabase CLI, or do you prefer to manage the schema via Prisma, or raw SQL that I supply to you to run in the Supabase SQL Editor?
2. **Icons/UI Library**: Is integrating Shadcn UI acceptable for rapid, premium component building, or do you want raw Tailwind without component libraries?
3. **External Media Normalization**: Do you have a specific test list of Allowed Domains for external image URLs?

## Verification Plan

### Automated Tests
- Type checking with TypeScript.
- Data validation checking using Zod.
- Unit testing normalization functions (e.g., YouTube URL parsing).

### Manual Verification
- Testing user registration and Role Assignment.
- Flow testing an Ad from Draft to Published using multiple simulated accounts (Client -> Mod -> Admin).
- Cron testing (manually triggering the API route) to verify ads transition to Expired.
