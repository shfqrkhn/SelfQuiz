# Exam Practice Quiz Web App

A self-contained, single-file HTML exam simulator designed for realistic exam practice. This tool dynamically loads a JSON-based question bank from GitHub Pages (or any comparable static hosting service) and offers a variety of features intended to emulate real test-taking conditions.

Online demo: https://shfqrkhn.github.io/SelfQuiz/

## Features

- **Dynamic Question Bank Loading:**  
  Automatically retrieve, parse, and display multiple-choice questions from any correctly formatted JSON file hosted online.

- **Timed Exam Mode:**  
  Simulate the pressure of a real exam with a countdown timer. The quiz duration is configurable via the JSON file, defaulting to 30 minutes if no duration is provided.

- **Section-Based Practice Mode:**  
  Focus your study by filtering questions based on specific categories or subjects included in your question bank.

- **Real-Time Scoring & Feedback:**  
  Get immediate feedback after every question. Each answer includes a brief explanation and optionally a reference to additional study materials or guides.

- **Exam-Like Navigation:**  
  Easily flag questions for review and navigate backward or forward through the exam, just like in full-scale exam software.

- **Progress Saving:**  
  Your progress — including flagged questions, answers, and current score — is automatically saved using local storage, allowing you to pick up exactly where you left off.

- **Randomization:**  
  Both question order and answer choices are randomized to prevent pattern recognition and encourage genuine learning.

- **PWA Functionality:**  
  With a built-in service worker, the app caches its assets to allow offline usage, so you can practice anytime, anywhere.

- **Minimalist & Responsive UI:**  
  A clean, user-friendly interface that works seamlessly across desktops, tablets, and mobile devices.


## Contributing

Contributions are more than welcome! If you’d like to add features, suggest improvements, or report issues, please open an issue or submit a pull request.

## License

This project is open source and available under the terms of the [MIT License](LICENSE).

## Feedback

If you encounter any issues or have suggestions for improvements, feel free to open an issue in this repository.

---

Happy practicing and good luck on your exams!
