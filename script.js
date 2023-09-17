// Sélection des éléments DOM
const sentenceElement = document.querySelector(".sentence-to-write");
const textareaElement = document.querySelector(".textarea-to-test");
const timeElement = document.querySelector(".time");
const scoreElement = document.querySelector(".score");
const startButton = document.querySelector(".start-btn");

// Paramètres du jeu
const totalTime = 60; // 60 secondes
let spansFromJsonSentence;
let extraitsFromJSON;
let time;
let score = 0;
let timerID;
let locked = false;
let totalScore = 0; // Variable pour le score total
let totalTypedCharacters = 0; // Variable pour le nombre total de caractères saisis
let totalIncorrectCharacters = 0; // Variable pour le nombre total de caractères incorrects
let partialScore = 0; // Variable pour le score partiel

// Fonction pour obtenir une nouvelle phrase aléatoire
function getNewSentence() {
  const randomIndex = Math.floor(Math.random() * extraitsFromJSON.length);
  const newSentence = extraitsFromJSON[randomIndex].texte;

  // Efface le contenu de la phrase actuelle
  sentenceElement.textContent = "";

  // Crée des éléments <span> pour chaque caractère de la phrase
  newSentence.split("").forEach((character) => {
    const spanCharacter = document.createElement("span");
    spanCharacter.textContent = character;
    sentenceElement.appendChild(spanCharacter);
  });

  // Met à jour les éléments <span> de la phrase
  spansFromJsonSentence = sentenceElement.querySelectorAll(".sentence-to-write span");
  textareaElement.value = "";
  locked = false;

  // Affiche la phrase chargée
  sentenceElement.textContent = newSentence;
}

// Chargement des extraits depuis le fichier JSON
fetch("extraits.json")
  .then((response) => {
    if (!response.ok) throw new Error("Erreur de chargement des données JSON");
    return response.json();
  })
  .then((data) => {
    extraitsFromJSON = data;
    console.log("Extraits JSON chargés avec succès : ", extraitsFromJSON);
    getNewSentence();
  })
  .catch((error) => {
    console.error("Erreur lors du chargement des données", error);
  });

// Fonction pour changer la phrase lorsque l'utilisateur a terminé de taper
function changeSentenceIfFinished() {
  const typedText = textareaElement.value.trim();
  const sentenceText = [...spansFromJsonSentence].map((span) => span.textContent).join("");
  if (typedText === sentenceText) {
    totalScore += partialScore; // Ajoute le score partiel au score total
    getNewSentence();
    console.log("Phrase terminée avec succès.");
  }
}

textareaElement.addEventListener("input", changeSentenceIfFinished);

// Écouteur d'événement pour le bouton de démarrage
startButton.addEventListener("click", handleStart);

// Fonction pour gérer le démarrage du jeu
function handleStart() {
  if (!sentenceElement.textContent) sentenceElement.textContent = "Attendez l'arrivée de la phrase";
  if (timerID) {
    clearInterval(timerID);
    timerID = undefined;
  }

  time = totalTime;
  timeElement.classList.add("active");
  textareaElement.classList.add("active");
  timeElement.textContent = `Temps : ${time}`;
  scoreElement.textContent = `Score : ${totalScore}`;
  textareaElement.value = "";
  spansFromJsonSentence.forEach((span) => (span.className = ""));
  textareaElement.addEventListener("input", handleTyping);
  textareaElement.focus();
  totalScore = 0;
  totalTypedCharacters = 0;
  startTimer();
}

// Fonction pour gérer la saisie de texte
function handleTyping() {
  totalTypedCharacters++;
  if (locked) return;
  if (!timerID) startTimer();
  const completedSentence = checkSpans();
  if (completedSentence) {
    locked = true;
    getNewSentence();
    totalScore += partialScore; // Ajoute le score partiel au score total
    scoreElement.textContent = `Score : ${totalScore}`;
    console.log("Phrase complétée avec succès. Score total : " + totalScore);
  }
}

// Fonction pour démarrer le minuteur
function startTimer() {
  timerID = setInterval(() => {
    time--;
    timeElement.textContent = `Temps : ${time}`;
    if (time === 0) {
      clearInterval(timerID);
      const typingSpeed = Math.round((totalTypedCharacters / totalTime) * 60);
      document.querySelector(".typing-speed").textContent = `Vitesse de frappe : ${typingSpeed} caractères par minute`;
      console.log(typingSpeed);
      timeElement.classList.remove("active");
      textareaElement.classList.remove("active");
      const precisionRatio = totalScore / (totalTypedCharacters + totalIncorrectCharacters);
      let precisionPercentage = Math.round(precisionRatio * 100);
      document.querySelector(".typing-accuracy").textContent = `Précision: ${precisionPercentage}%`;
      const spansFromJsonSentence = sentenceElement.querySelectorAll("span");
      spansFromJsonSentence.forEach((span) =>
        span.classList.contains("correct") ? (totalScore++, span.classList.remove("correct")) : ""
      );
      const finalScoreElement = document.getElementById("final-score");
      finalScoreElement.textContent = totalScore;
      const gameOverMessage = document.querySelector(".game-over");
      gameOverMessage.style.display = "block";
      console.log("Temps écoulé. Fin du jeu.");
    }
  }, 1000);
}

// Fonction pour vérifier les caractères saisis
function checkSpans() {
  const textareaCharactersArray = textareaElement.value.split("");
  let completedSentence = true;
  partialScore = 0; // Réinitialise le score partiel
  let currentGoodLetters = 0;
  for (let i = 0; i < spansFromJsonSentence.length; i++) {
    if (textareaCharactersArray[i] === undefined) {
      spansFromJsonSentence[i].className = "";
      completedSentence = false;
    } else if (textareaCharactersArray[i] === spansFromJsonSentence[i].textContent) {
      spansFromJsonSentence[i].classList.remove("wrong");
      spansFromJsonSentence[i].classList.add("correct");
      currentGoodLetters++;
      partialScore++; // Incrémente le score partiel pour chaque caractère correct
    } else {
      spansFromJsonSentence[i].classList.add("wrong");
      spansFromJsonSentence[i].classList.remove("correct");
      completedSentence = false;
    }
  }
  scoreElement.textContent = `Score : ${totalScore + partialScore}`; // Affiche le score total
  return completedSentence;
}
