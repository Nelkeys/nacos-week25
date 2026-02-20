// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD2wamg6PfAETmforsP3XMlvqfmhwD3oyk",
    authDomain: "nacosweek26.firebaseapp.com",
    projectId: "nacosweek26",
    storageBucket: "nacosweek26.firebasestorage.app",
    messagingSenderId: "816518095046",
    appId: "1:816518095046:web:e2d3fe76c5c9c5db3db7c7"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", function () {
  const numberSelectionSection = document.getElementById("number-selection");
  const quizPageSection = document.getElementById("quiz-page");
  const numbersContainer = document.getElementById("numbers");
  const quizTitle = document.getElementById("quiz-title");
  const quizQuestion = document.getElementById("quiz-question");
  const quizOptions = document.getElementById("quiz-options");
  const nextBtn = document.getElementById("next-btn");

  let selectedNumbers = [];
  let currentNumber = null;
  let selectedOption = null;
  let correctAnswer = "";
  const optionLabels = ["A", "B", "C", "D"];

  // Popup styling
  const resultPopup = document.createElement("div");
  resultPopup.className =
    "hidden fixed top-20 right-5 bg-white text-gray-900 px-4 py-2 rounded-md shadow-md text-center text-lg font-bold transition-all duration-300";
  document.body.appendChild(resultPopup);

  for (let i = 1; i <= 11; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className =
      "w-14 h-14 flex items-center justify-center rounded-full text-lg font-bold bg-primary hover:bg-green-700 text-white transition duration-300 shadow-lg";
    btn.dataset.number = i;
    btn.addEventListener("click", function () {
      if (!selectedNumbers.includes(i)) {
        selectedNumbers.push(i);
        currentNumber = i;
        loadQuiz(i);
        btn.disabled = true;
        btn.classList.replace("bg-primary", "bg-gray-400");
        btn.classList.add("cursor-not-allowed");
      }
    });
    numbersContainer.appendChild(btn);
  }

  const checkBtn = document.createElement("button");
  checkBtn.textContent = "Reveal Answer";
  checkBtn.className =
    "hidden mt-6 px-6 py-2 border border-2 border-yellow-500 text-yellow-500 rounded-full hover:bg-yellow-900";
  checkBtn.addEventListener("click", function () {
    if (selectedOption) {
      let isCorrect = selectedOption.lastChild.textContent === correctAnswer;
      resultPopup.textContent = isCorrect ? "Correct!" : "Wrong!";
      resultPopup.className = `fixed top-20 right-5 px-4 py-2 rounded-md shadow-md text-center text-lg font-bold transition-all duration-300 ${
        isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"
      }`;
      resultPopup.classList.remove("hidden");

      setTimeout(() => {
        resultPopup.classList.add("hidden");
      }, 3000);

      // Disable further selection
      quizOptions.classList.add("pointer-events-none");

      selectedOption.classList.add(
        isCorrect ? "bg-green-600" : "bg-red-600",
        "text-white"
      );
      Array.from(quizOptions.children).forEach((btn) => {
        if (btn.lastChild.textContent === correctAnswer) {
          btn.classList.add("bg-green-600", "text-white");
        }
      });

      nextBtn.classList.remove("hidden");
      checkBtn.classList.add("hidden");
    }
  });
  quizPageSection.appendChild(checkBtn);

  nextBtn.addEventListener("click", function () {
    quizOptions.innerHTML = "";
    resultPopup.classList.add("hidden");
    selectedOption = null;
    correctAnswer = "";
    quizOptions.classList.remove("pointer-events-none");
    nextBtn.classList.add("hidden");
    checkBtn.classList.add("hidden");

    if (selectedNumbers.length === 11) {
      alert("You have completed all questions!");
      window.location.reload();
    } else {
      quizPageSection.classList.add("hidden");
      numberSelectionSection.classList.remove("hidden");
    }
  });

  function loadQuiz(number) {
    numberSelectionSection.classList.add("hidden");
    quizPageSection.classList.remove("hidden");
    quizTitle.textContent = "Question " + number;
    nextBtn.classList.add("hidden");
    checkBtn.classList.add("hidden");
    quizOptions.classList.remove("pointer-events-none");

    // Show Skeleton Loader
    quizQuestion.innerHTML = `<div class="skeleton h-6 w-full"></div>`;
    quizOptions.innerHTML = `
            <div class="skeleton h-12 w-full my-2"></div>
            <div class="skeleton h-12 w-full my-2"></div>
            <div class="skeleton h-12 w-full my-2"></div>
            <div class="skeleton h-12 w-full my-2"></div>
        `;

    db.collection("quiz2")
      .doc(String(number))
      .get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          quizQuestion.textContent = data.question;
          quizOptions.innerHTML = "";
          correctAnswer = data.answer;

          data.options.forEach((option, index) => {
            const optionBtn = document.createElement("button");
            optionBtn.className =
              "flex items-center w-full py-2 px-2 my-2 rounded-full border font-semibold bg-white text-gray-800 hover:bg-gray-300 transition duration-200 shadow text-left";

            const optionLabel = document.createElement("span");
            optionLabel.textContent = optionLabels[index];
            optionLabel.className =
              "w-8 h-8 flex items-center justify-center text-primary font-bold border border-2 border-primary rounded-full mr-3";

            const optionText = document.createElement("span");
            optionText.textContent = option;

            optionBtn.appendChild(optionLabel);
            optionBtn.appendChild(optionText);

            optionBtn.addEventListener("click", function () {
              if (!quizOptions.classList.contains("pointer-events-none")) {
                selectedOption = optionBtn;
                checkBtn.classList.remove("hidden");
                Array.from(quizOptions.children).forEach((btn) => {
                  btn.classList.remove("bg-gray-500", "text-white");
                });
                optionBtn.classList.add("bg-gray-500", "text-white");
              }
            });
            quizOptions.appendChild(optionBtn);
          });
        } else {
          quizQuestion.textContent = "No question found for this number.";
        }
      })
      .catch((error) => {
        console.error("Error fetching question: ", error);
        quizQuestion.textContent = "Error loading question.";
      });
  }
});
