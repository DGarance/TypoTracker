const sentence = document.querySelector(".sentence-to-write");
const textareaToTest = document.querySelector(".textarea-to-test");
const timeDisplayed = document.querySelector(".time");
const scoreDisplayed = document.querySelector(".score");
const startBtn = document.querySelector(".start-btn");
const totalTime = 60; // 60 secondes

let spansFromJsonSentence;
let extraitsFromJSON;
let time;
let score;
let timerID;
let locked = false;

// Fonction pour obtenir une nouvelle phrase aléatoire
function getNewSentence() {
  const randomIndex = Math.floor(Math.random() * extraitsFromJSON.length);
  const newSentence = extraitsFromJSON[randomIndex].texte;

  console.log("Nouvelle phrase chargée :", newSentence); // Log de la nouvelle phrase

  // Efface le contenu de la phrase actuelle
  sentence.textContent = "";

  // Crée des éléments <span> pour chaque caractère de la phrase
  newSentence.split("").forEach((character) => {
    const spanCharacter = document.createElement("span");
    spanCharacter.textContent = character;
    sentence.appendChild(spanCharacter);
  });

  // Met à jour les éléments <span> de la phrase
  spansFromJsonSentence = sentence.querySelectorAll(".sentence-to-write span");
  textareaToTest.value = "";
  locked = false;
}

// Charge les extraits depuis le fichier JSON
fetch("extraits.json")
  .then((response) => {
    if (!response.ok) throw new Error("Erreur de chargement des données JSON");
    return response.json();
  })
  .then((data) => {
    extraitsFromJSON = data;
    console.log("Extraits JSON chargés avec succès : ", extraitsFromJSON); // Log des extraits chargés
    getNewSentence();
  })
  .catch((error) => {
    console.error("Erreur lors du chargement des données", error);
  });

// Fonction pour changer la phrase lorsque l'utilisateur a terminé de taper
function changeSentenceIfFinished() {
  const typedText = textareaToTest.value.trim();
  const sentenceText = [...spansFromJsonSentence].map((span) => span.textContent).join("");

  if (typedText === sentenceText) {
    getNewSentence();
    console.log("Phrase terminée avec succès."); // Log de la phrase terminée
  }
}

textareaToTest.addEventListener("input", changeSentenceIfFinished);

// Écouteur d'événement pour le bouton de démarrage
startBtn.addEventListener("click", handleStart);

// Fonction pour gérer le démarrage du jeu
let totalScore = 0; // Variable pour le score total

// ...

function handleStart() {
  if (!sentence.textContent) sentence.textContent = "Attendez l'arrivée de la phrase";

  if (timerID) {
    clearInterval(timerID);
    timerID = undefined;
  }

  time = totalTime; // Utilisez le temps total défini

  timeDisplayed.classList.add("active");
  textareaToTest.classList.add("active");

  timeDisplayed.textContent = `Temps : ${time}`;
  totalScore = 0; // Initialisez le score total à zéro ici
  scoreDisplayed.textContent = `Score : ${totalScore}`; // Mettez à jour l'affichage du score
  textareaToTest.value = "";

  spansFromJsonSentence.forEach((span) => (span.className = ""));

  textareaToTest.addEventListener("input", handleTyping);
  textareaToTest.focus();

  startTimer(); // Démarrez le chronomètre
}

function handleTyping() {
  console.log("handleTyping a été déclenché");
  if (locked) return;
  if (!timerID) startTimer();

  const completedSentence = checkSpans();

  if (completedSentence) {
    locked = true;
    getNewSentence();
    totalScore += spansFromJsonSentence.length;
    scoreDisplayed.textContent = `Score : ${totalScore}`;
    console.log("Phrase complétée avec succès. Score total : " + totalScore); // Log du score total
  }
}

// ...

// Fonction pour démarrer le minuteur
function startTimer() {
  timerID = setInterval(() => {
    time--;
    timeDisplayed.textContent = `Temps : ${time}`;

    if (time === 0) {
      clearInterval(timerID);
      timeDisplayed.classList.remove("active");
      textareaToTest.classList.remove("active");

      const spansFromJsonSentence = sentence.querySelectorAll("span");
      spansFromJsonSentence.forEach((span) => (span.classList.contains("correct") ? score++ : ""));

      // Mettez à jour le score final dans l'élément HTML avec l'ID "final-score"
      const finalScoreElement = document.getElementById("final-score");
      finalScoreElement.textContent = score; // Assurez-vous que le score est correctement mis à jour ici

      // Affiche le message de fin de jeu à l'écran
      const gameOverMessage = document.querySelector(".game-over");
      gameOverMessage.style.display = "block";

      console.log("Temps écoulé. Fin du jeu.");
    }
  }, 1000);
}

// Fonction pour gérer le temps
function handleTime() {
  time--;
  timeDisplayed.textContent = `Temps : ${time}`;

  if (time === 0) {
    clearInterval(timerID);
    timeDisplayed.classList.remove("active");
    textareaToTest.classList.remove("active");

    const spansFromJsonSentence = sentence.querySelectorAll("span");
    spansFromJsonSentence.forEach((span) => (span.classList.contains("correct") ? score++ : ""));
    scoreDisplayed.textContent = `Score : ${score}`;
    textareaToTest.removeEventListener("input", handleTyping);
    console.log("Temps écoulé."); // Log du temps écoulé
  }
}

// Fonction pour vérifier les caractères saisis
function checkSpans() {
  const textareaCharactersArray = textareaToTest.value.split("");
  let completedSentence = true;
  let currentGoodLetters = 0;

  for (let i = 0; i < spansFromJsonSentence.length; i++) {
    if (textareaCharactersArray[i] === undefined) {
      spansFromJsonSentence[i].className = "";
      completedSentence = false;
    } else if (textareaCharactersArray[i] === spansFromJsonSentence[i].textContent) {
      spansFromJsonSentence[i].classList.remove("wrong");
      spansFromJsonSentence[i].classList.add("correct");
      currentGoodLetters++;
    } else {
      spansFromJsonSentence[i].classList.add("wrong");
      spansFromJsonSentence[i].classList.remove("correct");
      completedSentence = false;
    }
  }

  scoreDisplayed.textContent = `Score : ${score + currentGoodLetters}`;

  return completedSentence;
}
