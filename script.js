/***** Global Variables *****/
let examData; // Will be loaded from the JSON file
let currentIndex = 0;
let timerInterval;
let totalTime = 0;      // in seconds
let timeRemaining = 0;  // in seconds
let examMode = "chapter"; // "chapter" or "combined"
let currentChapter = "";
let combinedQuestions = [];
let currentQuestion = null;

// Update this URL to the raw link of your questions.json on GitHub:
const questionBankURL = "https://raw.githubusercontent.com/shfqrkhn/ExQuizMyPMP/main/questions.json";

/***** Utility Functions *****/
// Fisher-Yates (shuffle) algorithm
function shuffleArray(array) {
  let newArray = array.slice();
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Shuffle answer choices for a question and update the correct index.
function shuffleChoices(question) {
  if (!question.hasOwnProperty("shuffledOptions")) {
    let options = question.options.slice();
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    question.shuffledOptions = options;
    const correctAnswer = question.options[question.correctIndex];
    question.shuffledCorrectIndex = question.shuffledOptions.findIndex(opt => opt === correctAnswer);
  }
  return question;
}

/***** Exam Mode Functions *****/
// Populate the chapter dropdown.
function populateChapters() {
  const chapterSelect = document.getElementById('chapterSelect');
  chapterSelect.innerHTML = "";
  if (examData && examData.chapters && examData.chapters.length > 0) {
    examData.chapters.forEach(chapter => {
      const option = document.createElement('option');
      option.value = chapter.name;
      option.textContent = chapter.name;
      chapterSelect.appendChild(option);
    });
    chapterSelect.value = examData.chapters[0].name;
    currentChapter = examData.chapters[0].name;
  } else {
    document.getElementById('questionContainer').innerHTML = "<p>No chapters found.</p>";
  }
}

// Prepare the combined exam by aggregating questions from all chapters.
function prepareCombinedExam() {
  let allQuestions = [];
  examData.chapters.forEach(chapter => {
    allQuestions = allQuestions.concat(chapter.questions);
  });
  allQuestions = shuffleArray(allQuestions);
  const questionCount = parseInt(document.getElementById('questionCountSelect').value);
  if (allQuestions.length > questionCount) {
    allQuestions = allQuestions.slice(0, questionCount);
  }
  // Clear any previous shuffle state.
  allQuestions.forEach(q => {
    delete q.shuffledOptions;
    delete q.shuffledCorrectIndex;
  });
  combinedQuestions = allQuestions;
}

/***** Timer Functions *****/
// Update the timer display in HH:MM:SS format.
function updateTimerDisplay() {
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;
  document.getElementById('timeRemaining').textContent =
    (hours < 10 ? "0" + hours : hours) + ":" +
    (minutes < 10 ? "0" + minutes : minutes) + ":" +
    (seconds < 10 ? "0" + seconds : seconds);
}

// End the exam when time runs out.
function examTimeOver() {
  alert("Time's up! The exam will now end.");
  document.getElementById('questionContainer').innerHTML = "<p>Time's up! The exam is over.</p>";
  document.getElementById('feedback').textContent = "";
  document.getElementById('nextButton').style.display = "none";
  clearInterval(timerInterval);
}

// Start or restart the exam timer.
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  let numberOfQuestions = 0;
  if (examMode === "chapter") {
    const chapter = examData.chapters.find(ch => ch.name === currentChapter);
    numberOfQuestions = chapter ? chapter.questions.length : 0;
  } else if (examMode === "combined") {
    numberOfQuestions = parseInt(document.getElementById('questionCountSelect').value);
  }
  totalTime = numberOfQuestions * 75;
  timeRemaining = totalTime;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeRemaining--;
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timeRemaining = 0;
      updateTimerDisplay();
      examTimeOver();
    } else {
      updateTimerDisplay();
    }
  }, 1000);
}

/***** Question Display & Answer Functions *****/
function showQuestion() {
  const questionContainer = document.getElementById('questionContainer');
  let q;
  if (examMode === "chapter") {
    const chapter = examData.chapters.find(ch => ch.name === currentChapter);
    if (!chapter || currentIndex >= chapter.questions.length) {
      questionContainer.innerHTML = "<p>You have completed all questions in this chapter!</p>";
      document.getElementById('nextButton').style.display = "none";
      clearInterval(timerInterval);
      return;
    }
    q = chapter.questions[currentIndex];
  } else if (examMode === "combined") {
    if (!combinedQuestions || currentIndex >= combinedQuestions.length) {
      questionContainer.innerHTML = "<p>You have completed all questions in this exam!</p>";
      document.getElementById('nextButton').style.display = "none";
      clearInterval(timerInterval);
      return;
    }
    q = combinedQuestions[currentIndex];
  }
  q = shuffleChoices(q);
  currentQuestion = q;
  const optionsHTML = q.shuffledOptions.map((option, i) => `
    <li>
      <label>
        <input type="radio" name="answer" value="${i}"> ${option}
      </label>
    </li>
  `).join("");
  questionContainer.innerHTML = `
    <div class="question">
      <p>${q.question}</p>
      <ul class="questionOptions">
        ${optionsHTML}
      </ul>
      <button onclick="checkAnswer()">Submit Answer</button>
    </div>
  `;
  document.getElementById('feedback').textContent = "";
  document.getElementById('nextButton').style.display = "none";
}

function checkAnswer() {
  const selected = document.querySelector('input[name="answer"]:checked');
  const feedbackDiv = document.getElementById('feedback');
  if (!selected) {
    feedbackDiv.textContent = "Please select an answer.";
    return;
  }
  const userAnswer = parseInt(selected.value, 10);
  if (userAnswer === currentQuestion.shuffledCorrectIndex) {
    feedbackDiv.textContent = "Correct! " + (currentQuestion.explanation || "");
  } else {
    feedbackDiv.textContent = "Incorrect! " + (currentQuestion.explanation || "");
  }
  document.getElementById('nextButton').style.display = "block";
}

document.getElementById('nextButton').addEventListener('click', () => {
  currentIndex++;
  showQuestion();
});

/***** Event Handlers *****/
function setupModeSelection() {
  const modeRadios = document.getElementsByName("examMode");
  modeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      examMode = e.target.value;
      currentIndex = 0;
      if (examMode === "chapter") {
        document.getElementById('chapterSelection').style.display = "block";
        document.getElementById('combinedOptions').style.display = "none";
        currentChapter = document.getElementById('chapterSelect').value;
      } else {
        document.getElementById('chapterSelection').style.display = "none";
        document.getElementById('combinedOptions').style.display = "block";
        prepareCombinedExam();
      }
      startTimer();
      showQuestion();
    });
  });
}

function setupChapterSelection() {
  document.getElementById('chapterSelect').addEventListener('change', (e) => {
    currentChapter = e.target.value;
    currentIndex = 0;
    startTimer();
    showQuestion();
  });
}

function setupCombinedOptions() {
  document.getElementById('questionCountSelect').addEventListener('change', (e) => {
    currentIndex = 0;
    prepareCombinedExam();
    startTimer();
    showQuestion();
  });
}

/***** Initialization *****/
function initExam() {
  populateChapters();
  setupModeSelection();
  setupChapterSelection();
  setupCombinedOptions();
  examMode = document.querySelector('input[name="examMode"]:checked').value;
  currentChapter = document.getElementById('chapterSelect').value;
  currentIndex = 0;
  startTimer();
  showQuestion();
}

// Load exam data from the JSON file hosted on GitHub.
function loadExamData() {
  fetch(questionBankURL)
    .then(response => response.json())
    .then(data => {
      examData = data;
      initExam();
    })
    .catch(error => {
      console.error("Error loading exam data:", error);
      document.getElementById('questionContainer').innerHTML =
        "<p>Error loading exam data. Please try again later.</p>";
    });
}

// Start by loading the exam data.
loadExamData();
