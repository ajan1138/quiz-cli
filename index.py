import json
import random
import os
import threading
import time
import sys

DEFAULT_QUESTION_TIMER = 3  
PROGRESS_FILE = "quiz_progress.json" 

def load_questions_from_file(path):
    try:
        with open(path, 'r') as file:
            data = json.load(file)
            if isinstance(data['questions'], list) and len(data['questions']) > 0:
                return data['questions']
            else:
                raise ValueError("Invalid JSON structure.")
    except Exception as error:
        raise ValueError(f"Error loading questions from file: {str(error)}")

def filter_questions_by_difficulty(questions, difficulty):
    return [question for question in questions if question.get('difficulty') == difficulty]

def is_valid_answer(choices, answer):
    return answer.isdigit() and 1 <= int(answer) <= len(choices)

def clear_line():
    sys.stdout.write("\033[K")  

def countdown(question_timer):
    for sec in range(question_timer, 0, -1):
        clear_line()
        print(f"Time remaining: {sec} seconds", end="\r")
        time.sleep(1)
    clear_line()
    print("Time's up! Moving to the next question.")

def ask_question_with_timer(question, question_timer=DEFAULT_QUESTION_TIMER):
    question_thread = threading.Thread(target=countdown, args=(question_timer,))
    question_thread.start()

    question_type = question['type']
    if question_type in ['multiple_choice', 'true_false', 'fill_in_the_blank']:
        if question_type == 'multiple_choice':
            print(question['text'])
            for index, choice in enumerate(question['choices'], start=1):
                print(f"{index}. {choice}")
            user_answer = input("Your answer (choose by number): ")
            if is_valid_answer(question['choices'], user_answer):
                return question['choices'][int(user_answer) - 1]
        elif question_type == 'true_false':
            print(question['text'])
            user_answer = input("True or False (t/f): ").lower()
            if user_answer in ['t', 'f']:
                return user_answer
        elif question_type == 'fill_in_the_blank':
            print(question['text'])
            user_answer = input("Your answer: ")
            return user_answer

        question_thread.join()
        return None
    else:
        raise ValueError("Invalid question type")


def generate_report(user_answers, correct_answers):
    total_questions = len(correct_answers)
    print("\n--- Quiz Report ---")
    for index, (user_answer, correct_answer) in enumerate(zip(user_answers, correct_answers), start=1):
        user_answer_lower = user_answer.lower() if isinstance(user_answer, str) else user_answer
        correct_answer_lower = correct_answer.lower() if isinstance(correct_answer, str) else correct_answer
        if user_answer_lower == correct_answer_lower:
            print(f"Question {index}: Correct! (Your answer: {user_answer})")
        else:
            print(f"Question {index}: Incorrect! (Your answer: {user_answer}, Correct answer: {correct_answer})")

    correct_count = sum(1 for user_answer, correct_answer in zip(user_answers, correct_answers)
                       if str(user_answer).lower() == str(correct_answer).lower())
    print(f"\nTotal Questions: {total_questions}")
    print(f"Correct Answers: {correct_count}")
    print(f"Incorrect Answers: {total_questions - correct_count}")


def save_progress(progress):
    with open(PROGRESS_FILE, 'w') as progress_file:
        json.dump(progress, progress_file)


def load_progress():
    try:
        with open(PROGRESS_FILE, 'r') as progress_file:
            return json.load(progress_file)
    except FileNotFoundError:
        return None


def main():
    try:
        questions = load_questions_from_file("questions.json")

        progress = load_progress()
        if progress is None:
            progress = {"user_answers": []}

        difficulty_choice = input("Choose difficulty (starter/advanced): ").lower()
        if difficulty_choice not in ['starter', 'advanced']:
            raise ValueError("Invalid difficulty level.")

        filtered_questions = filter_questions_by_difficulty(questions, difficulty_choice)

 
        random.shuffle(filtered_questions)

        user_answers = progress["user_answers"]
        for question in filtered_questions[len(user_answers):]:
            user_answer = ask_question_with_timer(question)
            if user_answer is not None:
                user_answers.append(user_answer)
                progress["user_answers"] = user_answers
                save_progress(progress)

            correct_answers = [question['correct_answer'] for question in filtered_questions[:len(user_answers)]]
            generate_report(user_answers, correct_answers)

        if os.path.exists(PROGRESS_FILE):
            os.remove(PROGRESS_FILE)

        progress["user_answers"] = []

    except Exception as error:
        print(str(error))
    finally:
        save_progress(progress)

if __name__ == "__main__":
    main()