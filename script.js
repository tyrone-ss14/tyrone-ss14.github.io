const input = document.getElementById("input");
const paper = document.getElementById("paper");

input.addEventListener("input", render);
render();

// Parse SS14 markup
function render() {
  paper.innerHTML = parseSS14(input.value);
  applyFirstH1Cutoff();
}

function parseSS14(text) {
  let html = "";
  let stack = []; // tracks active tags
  let i = 0;

  while (i < text.length) {
    if (text[i] === "\\" && text[i+1] === "[") {
      // escaped bracket
      html += "[";
      i += 2;
      continue;
    }

    if (text[i] === "[") {
      // check for hidden []
      if (text[i+1] === "]") {
        // hidden block, skip everything inside brackets
        let end = text.indexOf("]", i+2);
        if (end === -1) { i += 2; continue; } else { i = end + 1; continue; }
      }

      // regex to match tags like [head=1], [color=Red], [bold], etc.
      const tagMatch = text.slice(i).match(/^\[(\/?)(head|color|bolditalic|bold|italic)(=?)([^\]]*)\]/i);
      const bulletMatch = text.slice(i).match(/^\[bullet\]/i);

      if (bulletMatch) {
        html += "• ";
        i += bulletMatch[0].length;
        continue;
      }

      if (tagMatch) {
        const [fullMatch, slash, tag, eq, value] = tagMatch;
        i += fullMatch.length;

        if (slash) {
          // closing tag
          if (stack.length > 0) {
            let idx = stack.map(s => s.tag).lastIndexOf(tag.toLowerCase());
            if (idx !== -1) {
              // close all tags above this one
              let closing = "";
              for (let j = stack.length - 1; j >= idx; j--) {
                closing += stack[j].htmlClose;
                stack.pop();
              }
              html += closing;
            }
          }
        } else {
          // opening tag
          let htmlOpen = "", htmlClose = "";
          switch(tag.toLowerCase()) {
            case "head":
              if (value === "1") { htmlOpen="<h1>"; htmlClose="</h1>"; }
              else if (value === "2") { htmlOpen="<h2>"; htmlClose="</h2>"; }
              else if (value === "3") { htmlOpen="<h3>"; htmlClose="</h3>"; }
              break;
            case "color":
              htmlOpen = `<span style="color:${value}">`;
              htmlClose = "</span>";
              break;
            case "bold":
              htmlOpen = "<b>"; htmlClose = "</b>"; break;
            case "italic":
              htmlOpen = "<em>"; htmlClose = "</em>"; break;
            case "bolditalic":
              htmlOpen = "<b><em>"; htmlClose = "</em></b>"; break;
          }
          html += htmlOpen;
          stack.push({tag: tag.toLowerCase(), htmlClose});
        }
        continue;
      }

      // unmatched [ → ignore or hide
      i++;
      continue;
    }

    // normal character
    html += text[i];
    i++;
  }

  // close all remaining open tags
  while (stack.length > 0) {
    html += stack.pop().htmlClose;
  }

  return html;
}
