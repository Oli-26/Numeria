# Nous

A multi-field learning app built with Blazor WebAssembly and Capacitor for Android. Nous covers 227 topics across 15 fields (mathematics, physics, chemistry, biology, geology, materials, computer science, history, economics, politics, philosophy, linguistics, literature, media and esoterica) through short lessons, quizzes, spaced review and hands-on simulators, and it keeps pointing out how the fields connect.

The Android package id and some internal names still say MathVoyager (the project's original name); they are kept for compatibility with installed copies and saved progress.

## Features

### Learning
- **227 topics, about 1,470 lessons, about 4,800 concepts, about 8,900 quiz questions**, all static JSON under `wwwroot/data/`
- **11 question types**: multiple choice, fill-in, true/false, numeric input, multiple select, categorize, concept matching, proof ordering, find-the-error, visual identify and visual puzzle
- **Lessons you must pass**: a lesson completes at 60% on its quiz (3 of 5); otherwise Nous points you back to the concepts you missed
- **Guess first**: selected concepts open with a prediction question before the explanation
- **Depth layers**: a Simpler / Standard / Deeper toggle on concepts that have extra layers
- **Explain it back**: write a concept in your own words, compare with a model answer, keep it in the Notebook
- **Spaced repetition** at the concept level: a review card tests the idea with a different question each time, and due cards are interleaved across topics
- **Worked examples**, a **Formula Codex**, and data-driven visuals (timelines, maps, flow and cycle diagrams, payoff matrices, sliders, charts)

### Connections
- **Knowledge graph** of all topics, where every link says in one sentence why the two topics connect
- **Echoes**: after a lesson, one or two links to where the same idea turns up in another field
- **Guided paths**: question-led journeys through 8 to 12 lessons from several fields (for example "How do we know the Earth is old?")
- **Big Questions** hub gathering paths, lessons, simulators and reading, including open-problem tours of the Riemann hypothesis, P vs NP and the foundations of quantum mechanics
- **Home recommendations**: continue, recommended next (by graph distance) and nearby topics in other fields, plus a daily pick
- **Synthesis quizzes** that need knowledge from several fields at once

### Simulators
Twenty free simulators, linked from the lessons they illustrate: Particle Sandbox, Cosmic Scale, Evolution Simulator, Cell Tour, Reaction Bench, Molecule Builder, Deep Time, Rock ID, Era Map, Trade Routes, Trolley Lab, Sound Shift, Phase Diagram, Algorithm Race, Cipher Decoder, Power Map, Market Sim, Front Page, Plot Geometry and Etymology Tracer.

### Progress and extras
- XP, levels, streaks, mastery challenges, topic runs, achievements and completion cards
- Shop for themes, avatars, power-ups and a few extras (Proof Builder, Mistake Museum, What If? Playground, Hall of Fame, Compendium of Constants)
- Optional leaderboard; daily challenge; fortune cookies; notepad during quizzes; text to speech for lessons

## Tech Stack

- **Frontend**: Blazor WebAssembly (.NET 8)
- **Mobile**: Capacitor 8 (Android)
- **Data**: Static JSON files loaded via HttpClient
- **Storage**: Browser localStorage for user progress
- **Styling**: Vanilla CSS with CSS custom properties for theming

No backend server required: the app runs entirely client-side.

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
├── Pages/                  # Razor page components
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
- `lessons.json`: lesson definitions with concepts and content
- `questions.json`: quiz questions for all lessons
- `mastery-questions.json`: harder questions for mastery challenges

Global data files:
- `topics.json`: topic metadata (name, color, difficulty, lesson count)
- `achievements.json`: achievement definitions and conditions
- `shop.json`: shop items and pricing
- `formula-codex.json`: formula reference entries
- `proof-challenges.json`: proof builder puzzles
- `mistake-challenges.json`: mistake museum puzzles
- `fortune-cookies.json`: daily quotes and facts
- `topic-graph.json`: topic nodes and prereq/related edges, each with a one-line `why`
- `paths.json`: guided paths (question, hook, ordered lesson steps with notes)
- `big-questions.json`: Big Questions hub entries and open-problem tours
- `concept-extras.json`: optional per-concept layers keyed by concept id: `discovery` (guess-first question), `modelSummary`, `contentHtmlSimple`, `contentHtmlDeep`, `simulatorRoute`, `visualizationType` + `visualizationConfig`
- `synthesis-quizzes.json`, `topic-resources.json`: cross-field quizzes and further reading

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
