const editor = document.getElementById("editor");
const paper = document.getElementById("paper");

function update() {
  paper.innerHTML = parseSS14(editor.value);
}

editor.addEventListener("editor", update);
update();
