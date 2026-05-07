# Phine

A mathematics learning app built with Blazor WebAssembly and Capacitor for Android. Learn topics from calculus to topology through interactive lessons, quizzes, and challenges.

## Features

### Core Learning
- **16 topics, 140 lessons** covering calculus, linear algebra, topology, number theory, probability, group theory, graph theory, differential geometry, set theory, fractals, Fourier analysis, complex analysis, theory of computation, philosophy of math, combinatorics, and differential equations
- **7 question types**: multiple choice, fill-in, true/false, concept matching, proof ordering, find-the-error, and visual identification
- **Worked examples** with step-by-step guided problem solving
- **Spaced repetition** review system for long-term retention
- **Formula Codex** reference for common formulas across topics

### Gamification
- **XP and leveling** system with streak tracking
- **Mastery challenges** with 4 tiers per topic (Apprentice, Adept, Master, Grandmaster)
- **Daily challenges** with bonus XP
- **Achievements** for milestones
- **Shop** with purchasable power-ups (XP boosts, streak freezes, hint packs) and unlockable features
- **Leaderboard** with online score submission
- **Completion cards** earned for finishing topics

### Extras
- **Proof Builder** — construct mathematical proofs from logical blocks
- **Mistake Museum** — spot errors in worked solutions
- **What If? Playground** — interactive math experiments with visualizations
- **Hall of Fame** — mathematician biographies with a Top Trumps card game
- **Compendium of Constants** — explore famous mathematical constants
- **Fortune Cookies** — daily math quotes and fun facts
- **Notepad** — scratchpad available during quizzes

### App
- 4 themes: default, dark, chalkboard, neon, blueprint
- Onboarding flow with personalized topic suggestions
- Session persistence — resume lessons and quizzes where you left off
- Profile page with detailed statistics and study history
- Shareable profile cards
- Sound effects and animations

## Tech Stack

- **Frontend**: Blazor WebAssembly (.NET 8)
- **Mobile**: Capacitor 8 (Android)
- **Data**: Static JSON files loaded via HttpClient
- **Storage**: Browser localStorage for user progress
- **Styling**: Vanilla CSS with CSS custom properties for theming

No backend server required — the app runs entirely client-side.

## Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (for Capacitor)
- [Android Studio](https://developer.android.com/studio) (for Android builds)

### Run in Browser
```bash
dotnet run
```
Opens at `http://localhost:5085` by default.

### Build for Android
```bash
# Publish the Blazor app
dotnet publish -c Release -o publish

# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android
```

Or build the APK directly:
```bash
cd android
./gradlew assembleDebug
```

The APK will be at `android/app/build/outputs/apk/debug/app-debug.apk`.

## Project Structure

```
├── Pages/                  # 22 Razor page components
├── Components/             # Shared components (QuizComponent, Icon, Notepad, etc.)
├── Services/               # Business logic (quiz engine, gamification, progress, etc.)
├── Data/                   # Repository interfaces and implementations
├── Models/                 # Data models (UserProfile, Question, Topic, etc.)
├── Layout/                 # MainLayout with nav bar
├── Shared/                 # NavBar component
├── wwwroot/
│   ├── css/                # Global styles + theme files
│   ├── data/               # All lesson, question, and content JSON files
│   ├── js/                 # Canvas visualizations, sound effects
│   └── img/                # Avatars and badges
├── android/                # Capacitor Android project
├── Program.cs              # Service registration and app startup
└── capacitor.config.json   # Capacitor configuration
```

## Content Structure

Each topic has its own directory under `wwwroot/data/` containing:
- `lessons.json` — lesson definitions with concepts and content
- `questions.json` — quiz questions for all lessons
- `mastery-questions.json` — harder questions for mastery challenges

Global data files:
- `topics.json` — topic metadata (name, color, difficulty, lesson count)
- `achievements.json` — achievement definitions and conditions
- `shop.json` — shop items and pricing
- `formula-codex.json` — formula reference entries
- `proof-challenges.json` — proof builder puzzles
- `mistake-challenges.json` — mistake museum puzzles
- `fortune-cookies.json` — daily quotes and facts

## Adding Content

To add a new topic:
1. Add the topic entry to `wwwroot/data/topics.json`
2. Create `wwwroot/data/{topic-id}/lessons.json` with lesson definitions
3. Create `wwwroot/data/{topic-id}/questions.json` with quiz questions
4. Create `wwwroot/data/{topic-id}/mastery-questions.json` for mastery challenges
5. Add the topic icon to the `GetTopicIcon` switch in `Pages/Index.razor`

To add questions to an existing topic, append to the topic's `questions.json`. Each question needs a unique `id`, a `lessonId` to associate it with, a `type`, and the answer fields.

## License

MIT License. See [LICENSE](LICENSE) for details.
