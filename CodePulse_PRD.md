# CodePulse Group Coding Accountability Platform
## Product Requirements Document
Version 1.0 • March 2026 • Confidential

**1. Executive Summary**
CodePulse is a web-based group accountability platform designed for computer science students. It connects to users' WakaTime accounts to pull real coding activity data, organises users into groups, and displays individual and group-level statistics on a shared leaderboard dashboard. The platform sends intelligent Email reminders based on each user's historical coding patterns and self-declared goals, helping students build consistent coding habits through peer visibility and data-driven nudges.

**2. Problem Statement**
CS students often struggle with maintaining consistency in coding practice. While existing tools like WakaTime provide individual activity tracking, they offer no peer visibility or accountability layer. There is currently no free, dedicated tool that combines real coding data with group motivation, goal tracking, and smart reminders tailored to individual habits.

**3. Goals and Objectives**
*   Enable groups of CS students to share their coding activity in a transparent, motivating environment.
*   Allow users to set language-specific or time-based coding goals and track progress against them.
*   Leverage each user's historical WakaTime data to deliver reminders at the most effective time — not too early, not after the coding window has already passed.
*   Provide granular privacy controls so users decide exactly what data to share with their group.

**4. Tech Stack**
*   **Frontend**: Next.js
*   **Backend & Database**: Supabase (PostgreSQL, Auth, Edge Functions)
*   **Email Integration**: Gmail API / Nodemailer (replaced SMS)
*   **Authentication**: Google OAuth via Supabase Auth

**5. User Roles**
*   **Group Admin**: Creates the group, receives the group ID, manages members
*   **Member**: Joins via group ID, connects WakaTime, sets goals, views dashboard

**6. Core Features**
**6.1 Authentication**
*   Sign up and log in using Google (Gmail) OAuth only.
*   No email/password registration is supported in v1.

**6.2 Group Management**
*   Any authenticated user can create a group and automatically becomes its admin.
*   A unique group ID is generated upon creation and shared with prospective members.
*   Members join by entering the group ID after logging in.
*   Admins can remove members from the group at any time.

**6.3 WakaTime Integration & Onboarding**
After joining a group, users are guided through a step-by-step onboarding flow:
1.  Create a WakaTime account (if they do not already have one).
2.  Install the WakaTime extension in their preferred IDE.
3.  Connect their WakaTime API key to CodePulse.
Once connected, CodePulse syncs coding data on a scheduled basis (minimum every 30 minutes).

**6.4 Group Dashboard**
*   Displays a leaderboard of all group members ranked by coding time, filterable by Today / This Week / This Month.
*   Each member's card shows: display name, total time coded, top programming language, and top project.
*   A bar chart visualises relative coding time per member for quick at-a-glance comparison.
*   Privacy controls allow each user to hide specific data fields (e.g., hide project names while still showing total time).

**6.5 Goal Setting**
*   Users can set personal goals, for example: "Code in Java for at least 1 hour today."
*   Goals specify: programming language (optional), minimum duration, and deadline (daily or weekly).
*   WakaTime data is automatically checked against each goal to determine completion status.
*   Completed goals are marked with a visual indicator visible to all group members.

**6.6 Intelligent Email Reminders**
*   The system analyses each user's historical WakaTime data to identify their typical coding hours.
*   If a goal deadline is approaching and the user has not yet met their target, an Email reminder is sent to their connected Gmail address.
*   Reminder timing is optimised to arrive when the user is still within their usual coding window — neither too early nor after the window has already closed.
*   Users can opt out of Email reminders at any time from their profile settings.

**6.7 Premium Features Expansion**
*   **Social Nudges & Kudos**: Users can send immediate, in-app toast notifications ("Nudges" to encourage coding, "Kudos" to celebrate achievements) to team members.
*   **Gamification & Badges**: Users earn Streaks (consecutive days coded) and Badges (e.g., "Night Owl", "Polyglot") displayed proudly on their profile and the leaderboard.
*   **The Arena (Global Leaderboard)**: Groups can opt-in to a global leaderboard to compete against other study cohorts for maximum cumulative coding hours.
*   **Deep Analytics**: A dedicated tab featuring a GitHub-style contribution heatmap and productivity insights (e.g., most productive time of day).
*   **Webhook Integrations**: Group admins can connect a Discord or Slack Webhook URL to automatically broadcast milestone events to their chat server.
*   **Weekly Digests**: An automated, richly designed HTML email summary sent every Sunday containing group stats, top coders, and individual progress.
*   **Premium Themes**: Support for both a dark glassmorphism aesthetic and a sleek light mode theme.

**7. User Stories**

| ID     | As a... | I want to... | So that... |
| :---   | :---    | :---         | :---       |
| US-01  | Student | Sign in with my Gmail | I don't need another password |
| US-02  | Student | Create a group and share the ID | My friends can join |
| US-03  | Member  | Connect my WakaTime account | My coding data is visible to the group |
| US-04  | Member  | See a leaderboard of my group | I know how I compare |
| US-05  | Member  | Set a goal to code in Python for 30 mins | I stay accountable |
| US-06  | Member  | Receive an Email when I haven't met my goal | I get reminded before it's too late |
| US-07  | Member  | Hide my project names from the group | I can protect sensitive work |
| US-08  | Admin   | Remove an inactive member | The group stays relevant |

**8. Non-Functional Requirements**
*   **Performance**: Dashboard must load within 3 seconds for groups of up to 50 members.
*   **Data Freshness**: WakaTime data must be synced at least every 30 minutes.
*   **Reliability**: Concurrent user requests handled reliably via Supabase's managed infrastructure.
*   **Security**: All data transmissions must use HTTPS. Users' WakaTime API keys must be stored encrypted at rest.

**9. Out of Scope (v1.0)**
*   Mobile application (iOS / Android)
*   Multiple group memberships per user (v1 supports one group per user)
*   Public group profiles or discovery
*   GitHub / GitLab repository integration
*(Note: Basic peer-to-peer interaction is now supported via Nudges and Kudos)*

**10. Success Metrics**

| Metric | Target |
| :---   | :---   |
| WakaTime Connection Rate | ≥80% of members connect within 48 hours of joining |
| Active Coding Frequency  | Average ≥3 active coding days per week per member |
| Email Engagement         | Open/action rate above 40% |
| User Motivation          | Positive feedback via in-app prompt after 2 weeks |
