// Sélection des éléments DOM
const sentenceElement = document.querySelector(".sentence"); // Element HTML pour afficher la phrase que le joueur doit saisir
const textareaElement = document.querySelector(".textarea"); // Element HTML pour saisir le texte
const timeElement = document.querySelector(".time"); // Element HTML pour afficher le temps restant
const scoreElement = document.querySelector(".score"); // Element HTML pour afficher le score
const startButton = document.querySelector(".start-btn"); // Element HTML pour le bouton de démarrage du jeu

// Paramètres du jeu
let game = {
  totalTime: 60, // Durée du jeu en secondes
  sentenceCharacters: null, // Caractères de la phrase à saisir
  gameExtraits: null, // Extraits de texte à saisir depuis le fichier JSON
  time: null, // Temps restant
  score: 0, // Score
  timerID: null, // ID du minuteur
  locked: false, // Verrouillage du jeu pour empêcher la saisie de texte pendant certaines périodes
  totalScore: 0, // Variable pour le score total
  totalTypedCharacters: 0, // Variable pour le nombre total de caractères saisis
  totalIncorrectCharacters: 0, // Variable pour le nombre total de caractères incorrects
  partialScore: 0, // Variable pour le score partiel
};

// Fonction pour obtenir une nouvelle phrase aléatoire
function getNewSentence() {
  const randomIndex = Math.floor(Math.random() * game.gameExtraits.length);
  const newSentence = game.gameExtraits[randomIndex].texte;

  // Efface le contenu de la phrase actuelle
  sentenceElement.textContent = "";

  // Crée des éléments <span> pour chaque caractère de la phrase
  newSentence.split("").forEach((character) => {
    const spanCharacter = document.createElement("span");
    spanCharacter.textContent = character;
    sentenceElement.appendChild(spanCharacter);
  });

  // Met à jour les éléments <span> de la phrase
  game.sentenceCharacters = sentenceElement.querySelectorAll(".sentence span");
  textareaElement.value = "";
  game.locked = false;

  // Affiche la phrase chargée
  sentenceElement.textContent = newSentence;
}

// Chargement des extraits de phrases depuis le fichier JSON
fetch("extraits.json")
  .then((response) => {
    if (!response.ok) throw new Error("Erreur de chargement des données JSON");
    return response.json();
  })
  .then((data) => {
    game.gameExtraits = data;
    console.log("Extraits JSON chargés avec succès : ", game.gameExtraits);
    getNewSentence();
  })
  .catch((error) => {
    console.error("Erreur lors du chargement des données", error);
  });

// Fonction appelée lorsque la phrase est terminée correctement
function changeSentenceIfFinished() {
  const typedText = textareaElement.value.trim();
  const sentenceText = [...game.sentenceCharacters].map((span) => span.textContent).join("");
  if (typedText === sentenceText) {
    game.totalScore += game.partialScore; // Ajoute le score partiel au score total
    getNewSentence();
    console.log("Phrase terminée avec succès.");
  }
}

// Fonction pour mettre à jour le texte d'un élément HTML
function updateText(element, text) {
  element.textContent = text;
}

// Écouteur d'événement pour le bouton de démarrage
startButton.addEventListener("click", handleStart);

// Fonction pour gérer le démarrage du jeu
function handleStart() {
  if (!sentenceElement.textContent) sentenceElement.textContent = "Attendez l'arrivée de la phrase";
  if (game.timerID) {
    clearInterval(game.timerID);
    game.timerID = undefined;
  }
  game.time = game.totalTime;
  timeElement.classList.add("active");
  textareaElement.classList.add("active");
  updateText(timeElement, `Temps : ${game.time}`);

  // Réinitialise le score à zéro au début d'une nouvelle partie
  game.totalScore = 0;
  updateText(scoreElement, `Score : ${game.totalScore}`);

  textareaElement.value = "";

  game.sentenceCharacters.forEach((span) => (span.className = ""));
  textareaElement.addEventListener("input", updateOnUserInput);
  textareaElement.focus();
  game.totalTypedCharacters = 0;
  startTimer();
}

// Fonction pour gérer la saisie de texte par le joueur
function updateOnUserInput() {
  game.totalTypedCharacters++;
  if (game.locked) return;
  if (!game.timerID) startTimer();
  const completedSentence = checkSpans();
  if (completedSentence) {
    game.locked = true;
    getNewSentence();
    game.totalScore += game.partialScore; // Ajoute le score partiel au score total
    updateText(scoreElement, `Score : ${game.totalScore}`);
    console.log("Phrase complétée avec succès. Score total : " + game.totalScore);
  }
}

// Fonction pour démarrer le minuteur du jeu
function startTimer() {
  game.timerID = setInterval(() => {
    game.time--;
    updateText(timeElement, `Temps : ${game.time}`);
    if (game.time === 0) {
      endGame();
    }
  }, 1000);
}

// Fonction pour vérifier les caractères saisis par le joueur et mettre à jour les classes CSS
function checkSpans() {
  const textareaCharactersArray = textareaElement.value.split("");
  let completedSentence = true;
  game.partialScore = 0; // Réinitialise le score partiel

  for (let i = 0; i < game.sentenceCharacters.length; i++) {
    if (textareaCharactersArray[i] === undefined) {
      game.sentenceCharacters[i].className = "";
      completedSentence = false;
    } else if (textareaCharactersArray[i] === game.sentenceCharacters[i].textContent) {
      game.sentenceCharacters[i].classList.remove("wrong");
      game.sentenceCharacters[i].classList.add("correct");
      game.partialScore++; // Incrémente le score partiel pour chaque caractère correct
    } else {
      game.sentenceCharacters[i].classList.add("wrong");
      game.sentenceCharacters[i].classList.remove("correct");
      completedSentence = false;
      game.totalIncorrectCharacters++; // Incrémente le nombre total de caractères incorrects
    }
  }
  return completedSentence;
}

function endGame() {
  clearInterval(game.timerID);

  const typingSpeed = Math.round((game.totalTypedCharacters / game.totalTime) * 60);
  document.querySelector(".typing-speed").textContent = `Vitesse de frappe : ${typingSpeed} caractères par minute`;
  console.log(typingSpeed);
  timeElement.classList.remove("active");
  textareaElement.classList.remove("active");

  const precisionRatio = game.totalScore / (game.totalTypedCharacters + game.totalIncorrectCharacters);
  let precisionPercentage = Math.round(precisionRatio * 100);
  document.querySelector(".typing-accuracy").textContent = `Précision: ${precisionPercentage}%`;

  game.sentenceCharacters.forEach((span) =>
    span.classList.contains("correct") ? (game.totalScore++, span.classList.remove("correct")) : ""
  );

  const finalScoreElement = document.getElementById("final-score");
  updateText(finalScoreElement, game.totalScore);
  const gameOverMessage = document.querySelector(".game-over");
  gameOverMessage.style.display = "block";

  const closeBtn = document.querySelector(".close-modal");
  closeBtn.addEventListener("click", () => {
    gameOverMessage.style.display = "none";
  });
  console.log("Temps écoulé. Fin du jeu.");
  
}
