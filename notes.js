// Variables
var textToSave;
var workingTextArea;

// Selectors
var textArea = document.querySelectorAll(".text-area");

// Event Listeners
textArea.forEach((element) => {
  element.addEventListener("keyup", updateNotesStorage);
});
document.addEventListener("DOMContentLoaded", loadNotes);

// Objects

// Functions
function updateNotesStorage(event) {
  textToSave = event.srcElement.value;
  workingTextArea = event.srcElement.id;

  if (localStorage.getItem(workingTextArea) === null) {
    localStorage.setItem(workingTextArea, "");
  } else {
    localStorage.setItem(workingTextArea, textToSave);
  }
}

function loadNotes() {
  textArea.forEach((element) => {
    element.value = localStorage.getItem(element.id);
  });
}
