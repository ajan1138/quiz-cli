import ora from "ora";
import fs from "fs";
import chalk from "chalk";
import inquirer from "inquirer";
import {
  chooseDifficulty,
  parseQuestionsFromJSON,
  askQuestion,
  loadProgress,
  saveProgress,
  generateReport
} from "./src/functions.js";

const main = async () => {
  try {
    const selectedDifficulty = await chooseDifficulty();
    const loadingSpinner = ora(
      `Loading ${selectedDifficulty} questions...`
    ).start();

    await new Promise((resolve) => setTimeout(resolve, 2000));

    loadingSpinner.succeed(
      `${selectedDifficulty} questions loaded successfully`
    );

    let questions;
    let userAnswers = [];
    let counter = { correct: 0, wrong: 0 };

    const savedProgress = loadProgress();

    if (savedProgress && savedProgress.difficulty === selectedDifficulty) {
      questions = savedProgress.questions;
      userAnswers = savedProgress.userAnswers;
      counter = savedProgress.counter;

      console.log(chalk.yellow("Resuming quiz from the last saved progress."));
    } else {
      questions = parseQuestionsFromJSON(
        "questions.json",
        selectedDifficulty
      );
    }

    for (let i = userAnswers.length; i < questions.length; i++) {
      const userAnswer = await askQuestion(questions[i], counter);
      userAnswers.push(userAnswer);
      saveProgress({
        difficulty: selectedDifficulty,
        questions,
        userAnswers,
        counter,
      });
    }

    generateReport(userAnswers, questions);

    fs.unlinkSync("progress.json");
  } catch (error) {
    console.error(error.message);
  }
};

main();
