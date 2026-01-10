const input = document.getElementById("input");
const paper = document.getElementById("paper");

input.addEventListener("input", render);

function render() {
  const text = input.value;
  paper.innerHTML = parseSS14(text);
  applyFirstH1Cutoff();
}

// parse SS14 markup line by line
function parseSS14(text) {
  const lines = text.split(/\r?\n/);
  const parsedLines = lines.map(line => {
    const trimmed = line.trim();

    // Headers must be alone on the line
    if (/^\[head=1\].*?\[\/head\]$/i.test(trimmed)) {
      line = trimmed.replace(/\[head=1\](.*?)\[\/head\]/i, "<h1>$1</h1>");
    } else if (/^\[head=2\].*?\[\/head\]$/i.test(trimmed)) {
      line = trimmed.replace(/\[head=2\](.*?)\[\/head\]/i, "<h2>$1</h2>");
    } else if (/^\[head=3\].*?\[\/head\]$/i.test(trimmed)) {
      line = trimmed.replace(/\[head=3\](.*?)\[\/head\]/i, "<h3>$1</h3>");
    }

    // Inline formatting for all lines
    line = line
      .replace(/\[bold\](.*?)\[\/bold\]/gi, "<b>$1</b>")
      .replace(/\[italic\](.*?)\[\/italic\]/gi, "<em>$1</em>")
      .replace(/\[underline\](.*?)\[\/underline\]/gi, "<u>$1</u>")
      .replace(/\[color=(.*?)\](.*?)\[\/color\]/gi, '<span style="color:$1">$2</span>');

    return line;
  });

  return parsedLines.join("\n");
}

// First-line h1 cut-off like SS14
function applyFirstH1Cutoff() {
  const doc = paper;
  if (!doc) return;

  // reset all h1 margins
  doc.querySelectorAll("h1").forEach(h => h.style.marginTop = "");

  // find first visible element
  const firstEl = Array.from(doc.children).find(
    el => el.tagName && el.innerText.trim() !== ""
  );

  if (firstEl && firstEl.tagName === "H1") {
    firstEl.style.marginTop = "-0.3em";
  }
}

// Initial render
render();
