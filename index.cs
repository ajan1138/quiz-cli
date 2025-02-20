using System;
using System.Collections.Generic;
using System.IO;
using Newtonsoft.Json;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace QuizGame
{
    public class Question
    {
        public string Text { get; set; }
        public List<string> Choices { get; set; }
        [JsonProperty("correct_answer")]
        public string CorrectAnswer { get; set; }
        public string Difficulty { get; set; }
        [JsonProperty("type")]
        public string Type { get; set; }
    }

    public class Quiz
    {
        public List<Question> Questions { get; set; }
    }

    class Program
    {
        static int score = 0;
        static int questionTimeLimit = 3; 
        static int totalQuizTime = 0; 

        static async Task Main(string[] args)
        {
            try
            {
                string json = File.ReadAllText("questions.json");
                Quiz quiz = JsonConvert.DeserializeObject<Quiz>(json);

                if (quiz != null && quiz.Questions != null && quiz.Questions.Count > 0)
                {
                    int configuredTimeLimit = GetConfiguredTimeLimit(); 

                    if (configuredTimeLimit > 0)
                    {
                        questionTimeLimit = configuredTimeLimit;
                    }

                    totalQuizTime = questionTimeLimit * quiz.Questions.Count;

                    Console.WriteLine($"Total quiz time: {totalQuizTime} seconds.");

                    Console.WriteLine("Select Difficulty (1. Starter, 2. Advanced): ");
                    string selectedDifficulty = Console.ReadLine();
                    string difficulty = selectedDifficulty.Equals("1", StringComparison.OrdinalIgnoreCase) ? "starter" : "advanced";

                    var filteredQuestions = quiz.Questions
                        .Where(q => q.Difficulty.Equals(difficulty, StringComparison.OrdinalIgnoreCase))
                        .ToList();

                    filteredQuestions = filteredQuestions.OrderBy(x => Guid.NewGuid()).ToList();

                    int totalQuestions = filteredQuestions.Count;

                    foreach (var question in filteredQuestions)
                    {
                        Console.WriteLine($"Time remaining for this question: {questionTimeLimit} seconds");
                        var timerTask = TimerCallbackAsync(questionTimeLimit);

                        DisplayQuestion(question);

                        Console.Write("Your answer: ");
                        string userAnswer = Console.ReadLine();
                       
                        timerTask.ContinueWith(t => { }).Wait();

                        CheckAnswer(question, userAnswer);

                        Console.WriteLine($"Current Score: {score}");
                        Console.WriteLine();
                    }

                    Console.WriteLine($"Quiz complete! You scored {score} out of {totalQuestions}.");
                }
                else
                {
                    Console.WriteLine("No questions found in the quiz file.");
                }
            }
            catch (Exception error)
            {
                Console.WriteLine($"An error occurred: {error.Message}");
            }
        }

        private static async Task TimerCallbackAsync(int timeLeft)
        {
            for (int i = timeLeft; i > 0; i--)
            {
                Console.WriteLine($"Time Left: {i}");
                await Task.Delay(1000); // Delay for 1 second
            }
            Console.WriteLine("Time's up! Moving to the next question.");
        }

        private static void DisplayQuestion(Question question)
        {
            Console.WriteLine(question.Text);

            if (question.Type == "multiple_choice")
            {
                for (int i = 0; i < question.Choices.Count; i++)
                {
                    Console.WriteLine($"{i + 1}. {question.Choices[i]}");
                }
            }
        }

        private static void CheckAnswer(Question question, string userAnswer)
        {
            if (question == null)
            {
                Console.WriteLine("Error: Question is null.");
                return;
            }

            if (string.IsNullOrEmpty(question.CorrectAnswer))
            {
                Console.WriteLine("Error: Correct answer is null or empty.");
                return;
            }

            if (question.Type == "multiple_choice")
            {
                int choiceNumber;
                if (!int.TryParse(userAnswer, out choiceNumber) || choiceNumber < 1 || choiceNumber > question.Choices.Count)
                {
                    Console.WriteLine("Invalid input! Please enter a valid number between 1 and " + question.Choices.Count);
                    return;
                }

                if (question.Choices[choiceNumber - 1] == question.CorrectAnswer)
                {
                    Console.WriteLine("Correct!");
                    score++;
                }
                else
                {
                    Console.WriteLine($"Incorrect! The correct answer is: {question.CorrectAnswer}");
                }
            }
            else if (question.Type == "true_false")
            {
                userAnswer = userAnswer.Trim().ToLower();
                if (userAnswer != "t" && userAnswer != "f")
                {
                    Console.WriteLine("Invalid input! Please enter 't' for True or 'f' for False.");
                    return;
                }

                userAnswer = userAnswer == "t" ? "True" : "False";
                string correctAnswerNormalized = question.CorrectAnswer.Trim().ToLower() == "t" ? "True" : "False";

                if (userAnswer == correctAnswerNormalized)
                {
                    Console.WriteLine("Correct!");
                    score++;
                }
                else
                {
                    Console.WriteLine($"Incorrect! The correct answer is: {question.CorrectAnswer}");
                }
            }
            else
            {
                if (string.Equals(userAnswer.Trim(), question.CorrectAnswer.Trim(), StringComparison.OrdinalIgnoreCase))
                {
                    Console.WriteLine("Correct!");
                    score++;
                }
                else
                {
                    Console.WriteLine($"Incorrect! The correct answer is: {question.CorrectAnswer}");
                }
            }
        }

        private static int GetConfiguredTimeLimit()
        {
            return 0;
        }
    }
}
