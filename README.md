# Personal Blog Web

A modern, high-contrast, monochrome personal blogging web application designed for reading, writing, and engaging in discussions.

---

## Key Features

- **Minimalist Black & White Design**: High-contrast, typography-focused editorial layout for clean reading and navigation.
- **Post Discovery & Tag Filtering**: Easily browse articles and filter content by topics and tags.
- **Instagram-Style Like Button**: Interactive like counter with a clean heart icon.
- **Discussion & Commenting**: Readers can share thoughts, reply to existing comments, and join discussions seamlessly.
- **User Authentication**:
  - **User Accounts**: Create an account or sign in to save your identity across comments.
  - **Admin Workspace**: Admin role access for creating, editing, and deleting posts and managing comments.

---

## Quick Start

To run the application locally:

```bash
# Start all application services
./run.sh start

# Check the running status of backend and frontend
./run.sh status

# Restart services
./run.sh restart

# Stop all services
./run.sh stop
```

Once started, open [http://localhost:5173](http://localhost:5173) in your browser.

---

## User Guide

### 1. Reading & Exploring
- **Browse Articles**: View the latest posts on the home page.
- **Filter by Topic**: Click on any tag at the top of the home page to view posts under a specific topic.
- **Like Posts**: Click the heart button on any article to express appreciation.

### 2. Joining the Discussion
- **Leave a Comment**: Scroll to the bottom of any post to share your thoughts.
- **Reply to Others**: Click **REPLY** next to any comment to address a specific reader.
- **Account Sign Up**: Click **SIGN IN** in the navigation header to register a personal account or log into an existing one.

### 3. Publishing & Management (Admin)
- **Log In**: Sign in with an administrator account to unlock publishing tools.
- **Create Posts**: Click **NEW POST** in the top navigation bar to draft and publish articles with custom tags.
- **Edit & Delete**: Edit post content or remove articles and comments using the **EDIT** and **DELETE** controls.
