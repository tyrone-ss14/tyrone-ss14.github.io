const editor = document.getElementById("editor");
const paper = document.getElementById("paper");

function update() {
  console.log("update fired", editor.value);
  paper.innerHTML = parseSS14(editor.value);
}

editor.addEventListener("input", update);
update();
