# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains the development project for `claude-data-learning-teachers`, an NPX CLI package that installs data learning teacher agents into Claude Code projects. The teacher agents are designed to provide step-by-step learning guidance rather than complete code solutions, following a Socratic teaching methodology.

## Project Structure

The planned project structure follows this layout:
```
claude-data-learning-teachers/
├── package.json
├── bin/cli.js                     # CLI entry point
├── lib/
│   ├── installer.js              # Agent installation logic
│   ├── validator.js              # Claude Code project validation
│   ├── teachers-manager.js       # Teacher management utilities
│   └── utils.js                  # Common utilities
├── teachers/                     # Teacher agent templates
│   ├── data-engineer-teacher.md
│   ├── data-architect-teacher.md
│   ├── data-analyst-teacher.md
│   ├── data-scientist-teacher.md
│   └── ai-engineer-teacher.md
└── templates/                    # Learning templates
    ├── learning-roadmap.md
    └── progress-tracker.json
```

## Technology Stack

- **Runtime**: Node.js (ES6+)
- **CLI Framework**: Commander.js + Inquirer.js for interactive interface
- **File Operations**: fs-extra for robust file handling
- **Styling**: chalk for colored terminal output
- **Distribution**: NPM Registry

## Development Commands

Since this is a Node.js NPX package, typical development commands will include:
```bash
npm install                    # Install dependencies
npm test                      # Run tests
npm run lint                  # Run linting
npm run build                 # Build if needed
npm link                      # Link for local testing
npx claude-data-learning-teachers  # Test the CLI locally
```

## CLI Command Interface

The package provides these command options:
```bash
npx claude-data-learning-teachers                           # Interactive installation
npx claude-data-learning-teachers --all                     # Install all teachers
npx claude-data-learning-teachers --teachers data-engineer  # Install specific teacher
npx claude-data-learning-teachers --list                    # List installed teachers
npx claude-data-learning-teachers --roadmap                 # Generate learning roadmap
```

## Core Architecture

### Teacher Agent System
- Each teacher is implemented as a markdown file with structured content
- Teachers follow Socratic methodology: ask questions instead of providing direct answers
- Curriculum is divided into beginner/intermediate/advanced levels
- Progress tracking through JSON-based checkpoint system

### Installation Flow
1. **Project Detection**: Validate target is a Claude Code project (check for `.claude/agents/` directory)
2. **Interactive Selection**: Use Inquirer.js for teacher selection and level setting
3. **File Generation**: Copy teacher templates and create progress tracking files
4. **Configuration**: Generate `LEARNING_GUIDE.md` and `progress.json` in `.claude/agents/`

### Key Components

- **Validator**: Ensures target directory is a valid Claude Code project
- **Installer**: Handles file copying and template generation
- **Teachers Manager**: Manages teacher selection and customization based on skill level
- **Progress Tracker**: JSON-based system for tracking learning milestones

## Educational Philosophy

The teacher agents implement these core principles:
1. **No Direct Solutions**: Provide guidance and hints instead of complete code
2. **Step-by-Step Learning**: Break complex topics into manageable chunks
3. **Hands-on Practice**: Emphasize implementation over theory
4. **Checkpoint System**: Verify understanding at each learning stage
5. **Socratic Method**: Use questions to guide learners to solutions

## Target Integration

The package installs teacher agents into existing Claude Code projects by:
- Adding teacher markdown files to `.claude/agents/` directory
- Creating learning guidance documentation
- Setting up progress tracking system
- Providing personalized curriculum based on selected skill level

## Implementation Priority

1. Basic CLI structure and project validation
2. Teacher selection and curriculum customization
3. Learning progress tracking system
4. Task management and feedback mechanisms
5. Learning effectiveness measurement and improvement suggestions