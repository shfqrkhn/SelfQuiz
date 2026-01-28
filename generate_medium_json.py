import json
import random
import string

def generate_random_string(length):
    return ''.join(random.choices(string.ascii_letters + string.digits + " ", k=length))

def generate_large_json(filename, target_size_mb):
    questions = []
    current_size = 0
    target_size_bytes = target_size_mb * 1024 * 1024

    # We account for JSON structure overhead
    overhead_estimate = 50

    i = 1
    while current_size < target_size_bytes:
        q_text = generate_random_string(100 + random.randint(0, 50))
        choices = [generate_random_string(20 + random.randint(0, 30)) for _ in range(4)]
        explanation = generate_random_string(200 + random.randint(0, 100))

        question = {
            "questionText": q_text,
            "choices": choices,
            "correctAnswer": 0,
            "explanation": explanation
        }
        questions.append(question)

        # Rough estimation of size
        current_size += len(json.dumps(question))
        i += 1

    data = {
        "topic": "Benchmark Quiz",
        "questions": questions
    }

    with open(filename, 'w') as f:
        json.dump(data, f)

    print(f"Generated {filename} with {len(questions)} questions. Size: {current_size / (1024*1024):.2f} MB")

if __name__ == "__main__":
    generate_large_json("medium_quiz.json", 4.5)
