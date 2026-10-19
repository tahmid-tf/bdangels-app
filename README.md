# Bangladesh Angels Mobile Application (`bdangels-app`)

[![React Native](https://img.shields.io/badge/React_Native-0.86.3-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo_SDK-57.0.28-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![Expo Router](https://img.shields.io/badge/Expo_Router-v4-black?logo=expo&logoColor=white)](https://docs.expo.dev/router/introduction/)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Platform](https://img.shields.io/badge/Platforms-Android%20%7C%20iOS%20%7C%20Web-brightgreen)](#build--distribution)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

The official cross-platform mobile application for **Bangladesh Angels Network (BAN)** — the premier angel investment network connecting high-potential startups in Bangladesh with local and global angel investors, syndicate funds, and institutional capital.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
  - [Public & Community Portal](#1-public--community-portal)
  - [Investor Portal & Deal Room](#2-investor-portal--deal-room)
  - [Administrative Management Console](#3-administrative-management-console)
  - [Authentication & Access Control](#4-authentication--access-control)
- [Technology Stack](#technology-stack)
- [Directory Structure](#directory-structure)
- [Environment Configuration](#environment-configuration)
- [Getting Started](#getting-started)
- [Build & Distribution](#build--distribution)
  - [EAS Build Profiles](#eas-build-profiles)
  - [Android Builds](#android-builds)
  - [iOS Builds](#ios-builds)
- [Quality Assurance & Standards](#quality-assurance--standards)
- [Contributing & License](#contributing--license)

---

## 🌐 Overview

**bdangels-app** provides a unified mobile experience across Android, iOS, and Web. Designed specifically for founders, angels, and syndicate administrators, the app enables seamless startup pitch submissions, curated investment deal discovery, membership lifecycle management, and rich multimedia ecosystem reporting.

---

## ✨ Key Features

### 1. Public & Community Portal
- **Interactive Home & Showcase:** Dynamic hero section, ecosystem statistics, live featured startups portfolio, and corporate partner integrations.
- **Startup Pitching:** Founders can apply directly by submitting company profiles, one-line pitches, and uploading pitch decks (`.pdf`) via native file pickers.
- **Ecosystem Programs:** Dedicated portals for signature initiatives:
  - **Angel Academy:** Educational pathways and workshops for aspiring angels.
  - **BWIN (Bangladesh Women Investors Network):** Catalyzing female angel investors and founders.
  - **DeckVue:** Startup deck reviews and advisory services.
- **Knowledge & Publications:** Research whitepapers, industry publications, and blog articles with a native content renderer.
- **Events & Networking:** Upcoming and past venture summits, pitch sessions, and masterclasses.
- **Tiered Membership & Checkout:** Interactive plan selector (Free, Core, Advanced, Institutional) linked to an integrated checkout and payment workflow.

### 2. Investor Portal & Deal Room
- **Curated Deal Room:** Exclusive access to vetted venture deals, complete with company overviews, financials, investment terms, team backgrounds, and galleries.
- **Investment Intent:** Investors can register interest, commit capital, or request deep-dive deal reviews with a single tap.
- **Portfolio Tracking:** Personal dashboard tracking committed capital, portfolio ventures, and BAN Wealth transaction orders.
- **Profile & Password Management:** Update investor accreditation details, sectors of interest, and security credentials.

### 3. Administrative Management Console
- **Member Management:** Review pending accounts, approve members, verify emails, upgrade membership tiers, and toggle active/inactive statuses.
- **Deal Management (CRUD):** Create and publish deals, upload logos, covers, and media galleries, and monitor investor engagement activity in real time.
- **Pitch Deck Reviewer:** In-app Base64 PDF viewer and file downloader for submitted founder decks.
- **Dynamic Content CMS:** Update homepage statistics, program cards, featured portfolio order, team members, startup services, and blogs directly from mobile.
- **Communication & Notifications:** Audit and track mail campaigns, push alerts, and user interaction notifications.

### 4. Authentication & Access Control
- Secure token-based session management (`@react-native-async-storage/async-storage` with in-memory caching).
- Email & password authentication with input validation.
- **Google OAuth Integration:** In-app browser OAuth flow via `expo-web-browser` and deep linking redirect handling.
- **Role-Based Routing:** Tiered access protection ensuring paywalled deals and admin consoles are restricted to authorized accounts.

---

## 🛠 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [React Native 0.86.3](https://reactnative.dev/), [React 19.2.3](https://react.dev/), [Expo SDK 57](https://expo.dev/) |
| **Routing** | [Expo Router v4](https://docs.expo.dev/router/introduction/) (File-based routing) |
| **UI & Styling** | Custom Design System tokens (`theme.js`), Tailwind CSS utilities (`src/global.css`), Glassmorphism (`expo-glass-effect`) |
| **Icons & Media** | `@expo/vector-icons`, `expo-image` (hardware-accelerated WebP & Glide caching) |
| **Device & APIs** | `expo-document-picker`, `expo-file-system`, `expo-sharing`, `expo-web-browser`, `expo-constants` |
| **Animations & Web**| `react-native-reanimated`, `react-native-gesture-handler`, `react-native-webview` |
| **Build & CI/CD** | [EAS (Expo Application Services)](https://expo.dev/eas), Continuous Native Generation (CNG) |

---

## 📁 Directory Structure

```text
bdangels-app/
├── assets/                  # App icons, splash screens, logos, and static brand assets
│   ├── expo.icon/           # Adaptive Apple icon assets (iOS)
│   └── images/              # Logos, team photos, portfolio badges, and tab icons
├── src/
│   ├── app/                 # Expo Router screens (file-based navigation)
│   │   ├── _layout.jsx      # Root navigation stack and splash screen orchestrator
│   │   ├── index.jsx        # Landing / Home page
│   │   ├── startups.jsx     # Startup pitching & services
│   │   ├── investor.jsx     # Authenticated investor portal & deal room
│   │   ├── admin.jsx        # Administrative dashboard & CMS
│   │   ├── plans.jsx        # Membership pricing tiers
│   │   ├── checkout.jsx     # Subscription payment flow
│   │   ├── portfolio.jsx    # Funded companies directory
│   │   ├── team.jsx         # Executive leadership & team
│   │   ├── events.jsx       # Ecosystem events & webinars
│   │   ├── blogs/           # Blog listing and dynamic [slug] reader
│   │   ├── publications.jsx # Industry reports & whitepapers
│   │   ├── auth/            # OAuth callbacks & redirects
│   │   ├── login.jsx        # Member login
│   │   └── register.jsx     # Member registration
│   ├── components/          # Reusable modular UI components
│   │   ├── admin/           # Admin sidebar, modals, data tables
│   │   ├── home/            # Hero, Programs, Events, Team, and Pitch sections
│   │   ├── investor/        # Investor sidebar, deal cards, commitments
│   │   ├── modals/          # Deal details, event cards, program modals
│   │   ├── Header.jsx       # Global application header
│   │   └── SubpageHeader.jsx# Navigation header for secondary screens
│   ├── constants/           # Design system tokens, typography, and theme definitions
│   ├── hooks/               # Custom React hooks (theme, color scheme)
│   ├── services/            # API communication, auth storage, and networking layers
│   │   ├── api.js           # Centralized HTTP endpoints (public, investor, and admin)
│   │   └── auth.js          # Session state, tokens, and role-checking helpers
│   └── utils/               # Image URL normalizers, string helpers
├── app.json                 # Expo project configuration and native plugins
├── eas.json                 # EAS build and release pipeline profiles
├── package.json             # Project dependencies and operational scripts
└── tsconfig.json            # TypeScript configuration
```

---

## ⚙️ Environment Configuration

The app relies on Expo's built-in public environment variables. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Define the following environment variables:

```ini
# Centralized API Base URL for backend server
EXPO_PUBLIC_API_URL=https://bdangels.co/api

# Asset & Public Storage URL
EXPO_PUBLIC_STORAGE_URL=https://bdangels.co/storage
```

> **Local Development Tip:** When testing locally against a Laragon/local backend:
> - **Android Emulator:** Defaults to `http://10.0.2.2/api` automatically.
> - **iOS Simulator / Web:** Can target `http://bdangels.test/api` via local hosts resolution.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20.x or higher)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)
- [EAS CLI](https://github.com/expo/eas-cli) (`npm install -g eas-cli` or run via `npx eas-cli@latest`)
- Physical device with [Expo Go](https://expo.dev/go) or a configured Android/iOS simulator

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/bdangels-app.git
   cd bdangels-app
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npx expo start
   ```

4. **Run on specific target platforms:**
   ```bash
   npx expo start --android   # Open on connected Android device / emulator
   npx expo start --ios       # Open on iOS Simulator (macOS only)
   npx expo start --web       # Open in default web browser
   ```

---

## 📦 Build & Distribution

This project uses **EAS Build** with Continuous Native Generation (CNG). Native directories (`android/` and `ios/`) are generated dynamically during cloud or local prebuilds.

### EAS Build Profiles

Defined in [eas.json](file:///c:/Users/tahmi/OneDrive/Desktop/bdangels-app/eas.json):

| Profile | Target Artifact | Typical Use Case |
| :--- | :--- | :--- |
| **`preview`** | Android `.apk` / iOS Ad Hoc `.ipa` | Direct APK sideloading & internal physical iOS testing |
| **`preview-simulator`** | iOS Simulator `.app` (`.tar.gz`) | Rapid Mac iOS Simulator testing without Apple Developer certs |
| **`release-apk`** | Production-grade Android `.apk` | Standalone release APK connected to the production channel |
| **`production`** | Android `.aab` / iOS App Store `.ipa` | Google Play Store and Apple App Store / TestFlight submission |

### Android Builds

- **Build internal testing APK:**
  ```bash
  npx eas-cli@latest build -p android --profile preview
  ```
- **Build Google Play Store App Bundle (`.aab`):**
  ```bash
  npx eas-cli@latest build -p android --profile production
  ```

> **Note on Binary Size:** Universal release APKs support multiple CPU architectures (`arm64-v8a`, `armeabi-v7a`). For Play Store distribution, the production `.aab` outputs optimized split APKs that reduce download sizes down to **~20–30 MB** per device.

### iOS Builds

- **Build for iOS Simulator (Mac / no Apple Developer account required):**
  ```bash
  npx eas-cli@latest build -p ios --profile preview-simulator
  ```
- **Build for registered physical iPhones (Ad Hoc / UDID):**
  ```bash
  npx eas-cli@latest build -p ios --profile preview
  ```
- **Build for Apple TestFlight / App Store:**
  ```bash
  npx eas-cli@latest build -p ios --profile production
  ```

---

## 🧪 Quality Assurance & Standards

Before committing code or submitting pull requests, run project validation checks:

```bash
# Typecheck TypeScript definitions
npx tsc --noEmit

# Run Expo / ESLint static analysis
npx expo lint

# Diagnose dependencies and native project configuration
npx expo-doctor
```

---

## 📄 Contributing & License

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more details.

---

<p align="center">
  <b>Bangladesh Angels Network</b> • Empowering the Next Generation of Startups
</p>
