# Flow – Linear Speed. Exponential Flow.

Flow is a modern, high-performance project management tool designed for teams that prioritize speed and clarity. Built with a "MNC-standard" aesthetic, Flow combines powerful functionality with a premium user experience.

![Flow Dashboard](https://images.unsplash.com/photo-1540350394557-8d14678e7f91?q=80&w=2000&auto=format&fit=crop) *(Representation)*

## ✨ Key Features

### 🚀 High-Speed Kanban Board
- **Dynamic Columns**: Create, rename, and reorder columns directly on the board.
- **Drag & Drop**: Seamless task movement between statuses with smooth animations.
- **Advanced Task Cards**: Visual Jira-style ticket numbers (e.g., `PROJ-101`), priority indicators, and assignee avatars.

### 🛠️ Professional Task Management
- **Detailed View**: A premium side-drawer or modal for deep-diving into tasks.
- **Collaborative Comments**: Threaded activity logs to keep discussions contextual.
- **Smart Metadata**: Assignees, due dates, and priority levels (High, Medium, Low).
- **Auto-generated IDs**: Every project gets a unique key, and every task an auto-incrementing ticket ID.

### 👥 Team Collaboration
- **Hybrid Invitation System**: Send invites via professional email templates (powered by **Nodemailer**) and see **Pending Invites** live on your dashboard.
- **Role-based Settings**: Owners can manage project details, members, and custom board schemas (columns and labels).

### 🔔 Premium UI/UX
- **Custom Toast System**: Beautiful, non-intrusive notifications for every action.
- **Confirm Modals**: Custom-styled confirmation dialogs for destructive actions.
- **Mobile-First**: Fully responsive design that feels native on any device.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Vanilla CSS with a strict 8px spacing scale
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Email**: Nodemailer (SMTP Integration)
- **Auth**: Custom JWT-based session management

## 📂 Project Structure

```text
src/
├── actions/        # Server Actions (Project, Task, Invite logic)
├── app/            # Next.js App Router (Pages & Layouts)
├── components/     # React Components
│   ├── board/      # Kanban and Project views
│   ├── ui/         # Reusable design system (Buttons, Toasts, Dropdowns)
│   └── email/      # React-based email templates
├── lib/            # Utilities (Auth, DB connection, Email transporter)
├── models/         # Mongoose Schemas (Project, Task, User, Invitation)
```

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- MongoDB instance (Local or Atlas)
- SMTP credentials (e.g., Gmail App Password)

### 2. Installation
```bash
git clone <repository-url>
cd flow
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/flow
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Nodemailer SMTP Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 4. Run Locally
```bash
npm run dev
```

## 🛡️ Security & Performance
- **Server Actions**: All mutations are secured via server-side session checks.
- **Input Sanitization**: Strict validation on both client and server layers.
- **Optimistic UI**: Instant updates for better user perception of speed.
- **External Packages**: Optimized bundling for critical server-only modules like `nodemailer` and `mongoose`.

---
*Built with ❤️ for teams that need to Move Fast and Ship Better.*
