# Vokabeltrainer Deutsch-Indonesisch

A spaced repetition flashcard app for learning German-Indonesian vocabulary.

## Architecture

- **Frontend**: Vue.js 3 + Vite + Pinia + Vue Router
- **Backend**: C# ASP.NET Core 8 Web API
- **Database**: SQLite via Entity Framework Core
- **Vocabulary Data**: JSON file (`data/vocabularies.json`)

## Project Structure

```
├── frontend/          # Vue.js frontend
│   └── src/
│       ├── views/     # LoginView, RegisterView, FlashCardView
│       ├── stores/    # Pinia stores (userStore, vocabStore)
│       ├── services/  # API service, session manager
│       └── router/    # Vue Router config
├── backend/           # C# ASP.NET Core API
│   ├── Controllers/   # UserController, VocabProgressController
│   ├── Models/        # User, VocabProgress, DTOs
│   └── Data/          # EF Core DbContext
└── data/              # vocabularies.json
```

## Getting Started

### Frontend
```bash
cd frontend
npm install
npm run dev    # starts on http://localhost:3000
```

### Backend
```bash
cd backend
dotnet restore
dotnet run     # starts on http://localhost:5000
```

## How It Works

1. Register with a username and choose your learning direction (German or Indonesian)
2. Flashcards show the question in your known language
3. Tap to flip and see the answer + intermediate translation (DZ) in italics
4. Rate yourself: Red (2min) / Orange (5min) / Green (10min)
5. Green streak escalation: 10min → 1 day → 2 days → 4 days → 8 days
6. Progress auto-saves when you switch tabs or close the app
