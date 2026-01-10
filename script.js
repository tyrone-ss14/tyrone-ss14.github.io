const input = document.getElementById("input");
const paper = document.getElementById("paper");

function render() {
  let text = input.value;

  text = text.replace(/\[head=1\](.*?)\[\/head\]/gis, "<h1>$1</h1>");
  text = text.replace(/\[bold\](.*?)\[\/bold\]/gis, "<b>$1</b>");
  text = text.replace(/\[head=3\](.*?)\[\/head\]/gis, "<h3>$1</h3>");
  text = text.replace(/\n/g, "<br>");

  paper.innerHTML = text;
}

input.addEventListener("input", render);
render();
