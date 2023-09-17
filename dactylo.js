// Sélectionner les éléments du DOM

const textarea = document.getElementById("typing-test");
const textDisplay = document.getElementById("text-to-type");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");

// Charger le long texte

const text = "Le texte long à taper pour l'exercice de dactylographie";

// Afficher le texte à l'écran

textDisplay.innerText = text;

// Compteurs

let charsTyped = 0;
let incorrectChars = 0;

// Au keydown dans le textarea

textarea.addEventListener("keydown", () => {
  charsTyped++;

  // Vérifier si le caractère est correct

  const currentChar = text[charsTyped - 1];
  const typedChar = textarea.value.charAt(charsTyped - 1);

  if (currentChar !== typedChar) {
    incorrectChars++;
  }

  // Mettre à jour l'affichage des stats
});

// Quand texte terminé

textarea.addEventListener("keyup", () => {
  if (textarea.value === text) {
    // Calculer les stats
    const wpm = charsTyped / 5 / (charsTyped / 60);
    const accuracy = charsTyped / (charsTyped + incorrectChars);

    // Afficher les stats
    wpmDisplay.innerText = `${wpm} mots par minute`;
    accuracyDisplay.innerText = `Précision de ${accuracy}%`;
  }
});
