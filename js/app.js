// app.js

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDB6i-PmXbcvaiUtssqJz7UMN-RUCzSdtk",
    authDomain: "nacosweek25.firebaseapp.com",
    projectId: "nacosweek25",
    storageBucket: "nacosweek25.firebasestorage.app",
    messagingSenderId: "247236485385",
    appId: "1:247236485385:web:f287d9a432883ce72173d8",
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
    const resultText = document.getElementById("result");
    const nextBtn = document.getElementById("next-btn");
    const popup = document.getElementById("popup"); // Popup div
    const closePopup = document.getElementById("close-popup");

    let selectedNumbers = [];
    let currentNumber = null;
    const optionLabels = ["A", "B", "C", "D"];

    // Create number buttons (1-10)
    for (let i = 1; i <= 10; i++) {
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
                btn.classList.remove("bg-primary", "hover:bg-green-700");
                btn.classList.add("bg-gray-400", "cursor-not-allowed");

                // Removed the auto popup trigger from here.
                // if (selectedNumbers.length === 10) {
                //     setTimeout(() => {
                //         popup.classList.remove("hidden");
                //     }, 500);
                // }
            }
        });
        numbersContainer.appendChild(btn);
    }

    // Close popup button
    // closePopup.addEventListener("click", function () {
    //     popup.classList.add("hidden");
    // });

    // Next button resets quiz and returns to number selection or shows popup if all questions answered
    nextBtn.addEventListener("click", function () {
        quizOptions.innerHTML = "";
        resultText.textContent = "";
        currentNumber = null;
        quizPageSection.classList.add("hidden");

        if (selectedNumbers.length === 10) {
            // All questions answered, show popup on next button click.
            popup.classList.remove("hidden");
        } else {
            numberSelectionSection.classList.remove("hidden");
        }
    });

    // Load the quiz question from Firestore for the selected number
    function loadQuiz(number) {
        numberSelectionSection.classList.add("hidden");
        quizPageSection.classList.remove("hidden");
        quizTitle.textContent = "Question " + number;

        db.collection("quiz")
            .doc(String(number))
            .get()
            .then((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    quizQuestion.textContent = data.question;
                    quizOptions.innerHTML = "";

                    data.options.forEach((option, index) => {
                        const optionBtn = document.createElement("button");
                        optionBtn.className =
                            "flex items-center w-full py-2 px-2 my-2 rounded-full border font-semibold bg-white text-gray-800 hover:bg-gray-200 transition duration-200 shadow text-left";
                        
                        // Label (A, B, C, D)
                        const optionLabel = document.createElement("span");
                        optionLabel.textContent = optionLabels[index];
                        optionLabel.className = "w-8 h-8 flex items-center justify-center text-primary font-bold border border-2 border-primary rounded-full mr-3";
                        
                        // Option text
                        const optionText = document.createElement("span");
                        optionText.textContent = option;

                        // Append label and text to the button
                        optionBtn.appendChild(optionLabel);
                        optionBtn.appendChild(optionText);

                        optionBtn.addEventListener("click", function () {
                            Array.from(quizOptions.children).forEach((btn) => (btn.disabled = true));
                            if (option === data.answer) {
                                optionBtn.classList.add("bg-green-400", "text-white");
                                resultText.textContent = "Correct Answer!";
                                resultText.className = "mt-4 text-lg font-bold text-green-500";
                            } else {
                                optionBtn.classList.add("bg-red-400", "text-white");
                                resultText.textContent = "Wrong Answer!";
                                resultText.className = "mt-4 text-lg font-bold text-red-500";
                                Array.from(quizOptions.children).forEach((btn) => {
                                    if (btn.lastChild.textContent === data.answer) {
                                        btn.classList.add("bg-green-400", "text-white");
                                    }
                                });
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
