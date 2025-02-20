# Quiz App

## JAVASCRIPT

This is a simple CLI (Command Line Interface) quiz application built in Node.js using `inquirer`, `chalk`, and `ora`.

## Features

- Asks the user a series of questions with a time limit for each answer
- Uses `chalk` for colored text in the terminal
- Displays a "loading" effect using `ora`
- Tracks the score and displays the final result

## Installation

1. Clone the repository:

   ```sh
   git clone <repo-url>
   cd quiz-app
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

## Usage

Run the application with the following command:

```sh
node index.js
```

## How to Play

- Answer each question by entering the correct answer
- If the time limit expires, you lose a point
- At the end of the quiz, you receive your final score

## Dependencies

- `inquirer` - for user interaction
- `chalk` - for colored terminal output
- `ora` - for displaying a "loading" animation

# Quiz Application (CLI) - Python Version

This is a simple command-line quiz application built in Python. It uses a timer for each question, allows the user to choose difficulty levels, and tracks the progress and score throughout the quiz. The application will load questions from a JSON file, present them to the user, and provide a report of their performance at the end.

## Features

- Asks the user a series of questions with a time limit for each answer
- Tracks user progress and saves answers
- Allows the user to choose difficulty (starter/advanced)
- Displays a quiz report with correct and incorrect answers
- Timer countdown before each question
- Saves and loads progress between sessions
- Supports multiple question types: multiple choice, true/false, and fill-in-the-blank

## Installation

1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd quiz-app
   ```

## Install dependencies

2. pip install -r requirements.txt

## And play :D

# Quiz Application (CLI) - C# Version

This is a simple command-line quiz application built in C#. The application reads questions from a JSON file, presents them to the user with a timer, tracks the score, and displays the results at the end of the quiz. The user can choose between different difficulty levels and the quiz will shuffle the questions.

## Features

- Displays multiple choice, true/false, and fill-in-the-blank questions
- Timer countdown for each question
- Tracks user score
- Filters questions by difficulty (Starter/Advanced)
- Randomizes the order of questions
- Displays a report at the end with the user's score
- Saves quiz progress for later use

## Installation

1. Clone the repository:

   ```sh
   git clone <repo-url>
   cd quiz-app
   ```

2. Build and run the application using Visual Studio or the .NET CLI:

   ```dotnet build
   dotnet run
   ```

3. Usage:
   Run the application by executing the following command: dotnet run

4. ## Enjoy the game :D
