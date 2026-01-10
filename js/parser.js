// parser.js

// Handler maps
const openHandlers = {
  head: (value, openTags, outputParts) => {
    const level = parseInt(value, 10) || 1;
    const tag = `h${level}`;
    outputParts.push(`<${tag}>`);
    openTags.push({ type: 'head', tag });
  }
};

const closeHandlers = {
  head: (openTags, outputParts) => {
    for (let i = openTags.length - 1; i >= 0; i--) {
      if (openTags[i].type === 'head') {
        const tag = openTags[i].tag;
        outputParts.push(`</${tag}>`);
        openTags.splice(i, 1);
        break;
      }
    }
  }
};

// The actual parser function
function parseSS14(text) {
  let outputParts = [];
  let openTags = [];
  let i = 0;

  while (i < text.length) {
    if (text[i] === "[") {

      // Match opening tag [head=1] (robust)
      const openMatch = text.slice(i).match(/^\[head\s*=\s*(\d+)\]/i);
      if (openMatch) {
        const level = parseInt(openMatch[1], 10);
        openHandlers.head(level, openTags, outputParts);
        i += openMatch[0].length;
        continue;
      }

      // Match closing tag [/head]
      const closeMatch = text.slice(i).match(/^\[\/head\]/i);
      if (closeMatch) {
        closeHandlers.head(openTags, outputParts);
        i += closeMatch[0].length;
        continue;
      }
    }

    // Default: plain text
    outputParts.push(text[i]);
    i++;
  }

  // Close any remaining open tags
  while (openTags.length > 0) {
    const tag = openTags.pop();
    if (tag.type === 'head') outputParts.push(`</${tag.tag}>`);
  }

  return outputParts.join('');
}
