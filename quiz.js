const { useState, useEffect } = React;
const { createRoot } = ReactDOM;

// Initial hardcoded questions as a fallback
const INITIAL_QUIZ_QUESTIONS = [
  {
    question: "Which of these is a primitive data type in Java?",
    options: ["String", "int", "Array", "Class"],
    correctAnswer: "int",
  },
  {
    question: "What is the entry point for a Java application?",
    options: ["main()", "start()", "run()", "execute()"],
    correctAnswer: "main()",
  },
  {
    question: "What keyword is used to declare a constant in Java?",
    options: ["const", "final", "static", "volatile"],
    correctAnswer: "final",
  },
  {
    question: "Which of these is NOT an access modifier in Java?",
    options: ["public", "protected", "private", "internal"],
    correctAnswer: "internal",
  },
  {
    question: "What is the parent class of all classes in Java?",
    options: ["Main", "System", "Object", "JavaClass"],
    correctAnswer: "Object",
  },
  {
    question: "Which loop is guaranteed to execute at least once?",
    options: ["for loop", "while loop", "do-while loop", "foreach loop"],
    correctAnswer: "do-while loop",
  },
  {
    question: "What is the correct syntax to create an object of a class?",
    options: ["ClassName obj = new ClassName();", "new ClassName() obj;", "obj = new ClassName;", "ClassName new obj;"],
    correctAnswer: "ClassName obj = new ClassName();",
  },
  {
    question: "Which of these is used for multi-threading in Java?",
    options: ["Runnable interface", "Thread class", "Both of the above", "None of the above"],
    correctAnswer: "Both of the above",
  },
];

// Reusable component for the interactive background images
const FloatingShape = () => {
  const [size] = useState(() => Math.random() * 20 + 10);
  const [initialX] = useState(() => Math.random() * window.innerWidth);
  const [initialY] = useState(() => Math.random() * window.innerHeight);
  const [duration] = useState(() => Math.random() * 20 + 10);
  const [delay] = useState(() => Math.random() * 5);
  const [dx] = useState(() => (Math.random() - 0.5) * 400);
  const [dy] = useState(() => (Math.random() - 0.5) * 400);

  const [shape] = useState(() => Math.random() > 0.5 ? 'rounded-full' : 'rounded-lg');
  const [color] = useState(() => {
    const colors = ['bg-pink-500', 'bg-purple-500', 'bg-cyan-500', 'bg-teal-500'];
    return colors[Math.floor(Math.random() * colors.length)];
  });

  return (
    <div
      className={`absolute floating-shape opacity-40 ${color} ${shape}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: `${initialX}px`,
        top: `${initialY}px`,
        '--dx': `${dx}px`,
        '--dy': `${dy}px`,
        '--duration': `${duration}s`,
        '--delay': `${delay}s`,
      }}
    ></div>
  );
};

// Main App component
const App = () => {
  // App state
  const [quizQuestions] = useState(INITIAL_QUIZ_QUESTIONS);
  const [quizState, setQuizState] = useState('quiz');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  // Timer functionality
  useEffect(() => {
    if (quizState !== 'quiz') return;

    const timerId = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          handleNextQuestion(true);
          return 30; // Reset timer for next question
        }
        return prevTime - 1;
      });
    }, 1000);

    // Cleanup function to clear the interval
    return () => clearInterval(timerId);
  }, [currentQuestionIndex, quizState]);

  const handleAnswerClick = (option) => {
    setSelectedOption(option);
  };

  const handleNextQuestion = (isSkipped = false) => {
    if (selectedOption === null && !isSkipped) {
      setShowResultDialog(true);
      return;
    }
    
    // Add the user's answer to the list
    const newAnswer = {
      question: quizQuestions[currentQuestionIndex].question,
      selectedOption: isSkipped ? 'Skipped' : selectedOption,
      correctAnswer: quizQuestions[currentQuestionIndex].correctAnswer,
      isCorrect: isSkipped ? false : selectedOption === quizQuestions[currentQuestionIndex].correctAnswer,
    };
    setUserAnswers([...userAnswers, newAnswer]);

    // Update the score if the answer was correct
    if (newAnswer.isCorrect) {
      setScore(score + 1);
    }

    // Move to the next question or end the quiz
    if (currentQuestionIndex + 1 < quizQuestions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setTimeLeft(30);
    } else {
      setQuizState('results');
    }
  };

  const handleRestartQuiz = () => {
    setQuizState('quiz');
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswers([]);
    setSelectedOption(null);
    setTimeLeft(30);
  };

  const renderQuiz = () => {
    if (quizQuestions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-4 min-h-screen font-sans z-10">
          <div className="bg-transparent text-white w-full max-w-xl mx-auto text-center">
            <h2 className="text-xl font-bold mb-4 text-gray-800">No questions available.</h2>
          </div>
        </div>
      );
    }

    const questionData = quizQuestions[currentQuestionIndex];
    const progress = `${currentQuestionIndex + 1} of ${quizQuestions.length}`;

    return (
      <div className="flex flex-col items-center justify-center p-4 min-h-screen font-sans z-10">
        <div className="bg-transparent text-gray-800 w-full max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-4 text-sm font-semibold">
            <span className="text-gray-600">Question {progress}</span>
            <div className={`p-2 rounded-full text-white w-10 h-10 flex items-center justify-center font-bold shadow-lg ${timeLeft <= 10 ? 'bg-red-500 pulsing' : 'bg-blue-500'}`}>
              {timeLeft}
            </div>
          </div>
          <div className="text-xl font-bold text-center mb-6 text-gray-900">
            {questionData.question}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {questionData.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerClick(option)}
                className={`w-full text-left py-3 px-5 rounded-xl transition-all duration-200 backdrop-filter backdrop-blur-sm bg-gray-100 bg-opacity-50 hover:bg-opacity-70 text-gray-900
                  ${selectedOption === option
                    ? 'ring-2 ring-blue-500 scale-105'
                    : ''
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <button
              onClick={() => handleNextQuestion(true)}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-md transform hover:scale-105"
            >
              Skip
            </button>
            <button
              onClick={() => handleNextQuestion(false)}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-md transform hover:scale-105"
            >
              {currentQuestionIndex + 1 === quizQuestions.length ? 'Submit' : 'Next'}
            </button>
          </div>
          {showResultDialog && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
              <div className="relative p-6 border w-96 shadow-lg rounded-2xl bg-white text-center">
                <div className="text-xl font-semibold text-gray-800 mb-4">Please select an option to continue.</div>
                <button
                  onClick={() => setShowResultDialog(false)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl transition-all duration-200"
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderResults = () => {
    return (
      <div className="flex flex-col items-center justify-center p-4 min-h-screen font-sans z-10">
        <div className="bg-transparent w-full max-w-2xl mx-auto text-gray-800">
          <div className="text-center text-3xl font-bold mb-4 text-gray-900">Quiz Complete!</div>
          <div className="text-center text-xl font-semibold mb-6 text-gray-600">
            You scored {score} out of {quizQuestions.length}!
          </div>

          <div className="space-y-4">
            {userAnswers.map((answer, index) => (
              <div key={index} className="p-4 rounded-xl shadow-sm border border-gray-300 bg-gray-100 bg-opacity-50 backdrop-filter backdrop-blur-sm">
                <div className="font-semibold mb-2 text-gray-900">
                  Q{index + 1}: {answer.question}
                </div>
                <div className="text-sm">
                  Your Answer: <span className={`${answer.isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}`}>
                    {answer.selectedOption}
                  </span>
                </div>
                {!answer.isCorrect && (
                  <div className="text-sm">
                    Correct Answer: <span className="text-green-600 font-medium">{answer.correctAnswer}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center mt-8 space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleRestartQuiz}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-md transform hover:scale-105"
            >
              Restart Quiz
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-4">
      {Array.from({ length: 15 }).map((_, i) => (
        <FloatingShape key={i} />
      ))}
      {quizState === 'quiz' ? renderQuiz() : renderResults()}
    </div>
  );
};

// Render the main app component
const root = createRoot(document.getElementById('root'));
root.render(<App />);
