import fs from "fs";
import inquirer from "inquirer";
import chalk from "chalk";

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const parseQuestionsFromJSON = (path, difficulty) => {
  try {
    const rawData = fs.readFileSync(path);
    const parsedData = JSON.parse(rawData);

    if (
      Array.isArray(parsedData.questions) &&
      parsedData.questions.length >= 5
    ) {
      const validQuestions = parsedData.questions.every(
        (question) =>
          question.text &&
          question.correct_answer &&
          question.difficulty &&
          ((question.type === "multiple_choice" &&
            Array.isArray(question.choices) &&
            question.choices.length >= 4) ||
            question.type === "true_false" ||
            question.type === "fill_in_the_blank")
      );

      if (validQuestions) {
        const filteredQuestions = parsedData.questions.filter(
          (question) => question.difficulty === difficulty
        );

        if (filteredQuestions.length >= 5) {
          const shuffledQuestions = shuffleArray(filteredQuestions).slice(0, 5);
          return shuffledQuestions;
        } else {
          throw new Error(
            chalk.red("Insufficient questions for the selected difficulty.")
          );
        }
      } else {
        throw new Error(
          chalk.red("Invalid question structure in the JSON file.")
        );
      }
    } else {
      throw new Error(chalk.red("Invalid JSON file structure."));
    }
  } catch (error) {
    throw new Error(
      chalk.red(`Error loading questions from file: ${error.message}`)
    );
  }
};

export const isValidInput = (input, question) => {
  const userAnswer = input.trim().toLowerCase();

  if (question.type === "true_false") {
    if (!["t", "f"].includes(userAnswer)) {
      console.log("Invalid input. Please enter T or F.");
      return false;
    }
  } else if (question.type === "multiple_choice") {
    const numericInput = parseInt(userAnswer, 10);
    if (
      isNaN(numericInput) ||
      numericInput < 1 ||
      numericInput > question.choices.length
    ) {
      console.log(
        `Invalid input. Please enter a number between 1 and ${question.choices.length}.`
      );
      return false;
    }
  }

  return true;
};

const updateScoreboard = (counter) => {
  const scoreboard = `Scoreboard: ${chalk.green(
    `✔ ${counter.correct}`
  )} ${chalk.red(`✘ ${counter.wrong}`)}`;
  const padding = " ".repeat(process.stdout.columns - scoreboard.length);
  process.stdout.write(`\r${scoreboard}${padding}`);
};

export const askQuestion = async (question, counter, timeLimit = 10) => {
  console.log(chalk.bold("Question:"));
  console.log(question.text);

  if (question.type === "multiple_choice") {
    question.choices.forEach((choice, index) => {
      console.log(`  ${index + 1}. ${choice}`);
    });
  }

  return new Promise((resolve) => {
    let seconds = timeLimit;
    let isAnswered = false;

    const countdownInterval = setInterval(() => {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(
        `Time remaining: ${chalk.bold.yellow(seconds)} seconds`
      );
      seconds--;

      if (seconds < 0 && !isAnswered) {
        clearInterval(countdownInterval);
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        console.log(chalk.bold.red("Time's up!"));
        const defaultAnswer = "";
        resolve(defaultAnswer);
        isAnswered = true;
      }
    }, 1000);

    const prompt = {
      type: "input",
      name: "userAnswer",
      message: chalk.bold("Enter the serial number of your answer:"),
    };

    const getUserAnswer = () => {
      inquirer
        .prompt(prompt)
        .then((answer) => {
          clearInterval(countdownInterval);
          process.stdout.clearLine();
          process.stdout.cursorTo(0);

          const userAnswer = (answer.userAnswer || "").trim().toLowerCase();

          if (!isAnswered) {
            if (!userAnswer) {
              console.log(chalk.bold.red("No answer provided."));
              getUserAnswer();
              return;
            }

            let isCorrect = false;

            if (question.type === "true_false") {
              isCorrect = userAnswer === question.correct_answer;
            } else if (question.type === "multiple_choice") {
              const chosenOption = parseInt(userAnswer, 10);
              if (
                isNaN(chosenOption) ||
                chosenOption < 1 ||
                chosenOption > question.choices.length
              ) {
                console.log(
                  `Invalid input. Please enter a number between 1 and ${question.choices.length}.`
                );
                getUserAnswer();
                return;
              }
              isCorrect =
                question.choices[chosenOption - 1] === question.correct_answer;
            } else if (question.type === "fill_in_the_blank") {
              isCorrect = userAnswer === question.correct_answer.toLowerCase();
            }

            if (isCorrect) {
              console.log(chalk.green("Correct! 🎉"));
              counter.correct++;
            } else {
              if (question.type === "true_false") {
                if (!["t", "f"].includes(userAnswer)) {
                  console.log("Invalid input. Please enter T or F.");
                  getUserAnswer();
                  return;
                }
              } else if (question.type === "multiple_choice") {
                const numericInput = parseInt(userAnswer, 10);
                if (
                  isNaN(numericInput) ||
                  numericInput < 1 ||
                  numericInput > question.choices.length
                ) {
                  console.log(
                    `Invalid input. Please enter a number between 1 and ${question.choices.length}.`
                  );
                  getUserAnswer();
                  return;
                }
              }

              console.log(chalk.red("Incorrect! 😢"));
              counter.wrong++;
            }

            updateScoreboard(counter);
          }

          isAnswered = true;
          resolve(userAnswer);
        })
        .catch(() => {
          clearInterval(countdownInterval);
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          const defaultAnswer = "";
          resolve(defaultAnswer);
        });

      let remainingSeconds = timeLimit;
      const countdown = setInterval(() => {
        if (!isAnswered) {
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          process.stdout.write(
            `Time remaining: ${chalk.bold.yellow(remainingSeconds)} seconds`
          );
          remainingSeconds--;

          if (remainingSeconds < 0) {
            clearInterval(countdown);
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            console.log(chalk.bold.red("Time's up!"));
            const defaultAnswer = "";
            resolve(defaultAnswer);
            isAnswered = true;
          }
        } else {
          clearInterval(countdown);
        }
      }, 1000);
    };

    getUserAnswer();
  });
};

export const saveProgress = (progress) => {
  const data = JSON.stringify(progress);
  fs.writeFileSync("progress.json", data);
};

export const loadProgress = () => {
  try {
    const rawData = fs.readFileSync("progress.json");
    return JSON.parse(rawData);
  } catch (error) {
    return null;
  }
};

export const generateReport = (userAnswers, questions) => {
  const totalQuestions = questions.length;
  let correctCount = 0;
  let unansweredCount = 0;

  for (let i = 0; i < totalQuestions; i++) {
    const question = questions[i];
    const userAnswer = userAnswers[i];

    if (userAnswer) {
      let isCorrect = false;

      if (question.type === "true_false") {
        isCorrect = userAnswer === question.correct_answer;
      } else if (question.type === "multiple_choice") {
        const chosenOption = parseInt(userAnswer, 10);
        isCorrect =
          question.choices[chosenOption - 1] === question.correct_answer;
      } else if (question.type === "fill_in_the_blank") {
        isCorrect = userAnswer === question.correct_answer.toLowerCase();
      }

      if (isCorrect) {
        correctCount++;
      }
    } else {
      unansweredCount++;
    }
  }

  const incorrectCount = totalQuestions - correctCount;

  console.log(chalk.bold("\n--- Quiz Report ---"));
  console.log(chalk.bold.white(`Total Questions: ${totalQuestions}`));
  console.log(chalk.bold.green(`\n✔ Correct Answers: ${correctCount}`));
  console.log(chalk.bold.red(`\n✘ Incorrect Answers: ${incorrectCount}`));
  console.log(
    chalk.bold.yellow(`\n❓ Unanswered Questions: ${unansweredCount}`)
  );
};

export const chooseDifficulty = async () => {
  const difficultyPrompt = {
    type: "list",
    name: "difficulty",
    message: "Choose the difficulty level:",
    choices: ["starter", "advanced"],
  };

  const { difficulty } = await inquirer.prompt(difficultyPrompt);
  return difficulty;
};
