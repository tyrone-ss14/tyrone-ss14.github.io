const openHandlers = {
  head: (value, openTags, outputParts) => {
    const level = parseInt(value) || 1; // default to h1
    const tag = `h${level}`;
    outputParts.push(`<${tag}>`);
    openTags.push({ type: 'head', tag });
  }
};

const closeHandlers = {
  head: (openTags, outputParts) => {
    // Find the most recent head tag and close it
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

function parseSS14(text) {
  let outputParts = [];
  let openTags = [];
  let i = 0;

  while (i < text.length) {
    if (text[i] === "[") {

      // Match opening tag like [head=1]
      const openMatch = text.slice(i).match(/^\[head=(\d)\]/);
      if (openMatch) {
        const level = openMatch[1];
        openHandlers.head(level, openTags, outputParts);
        i += openMatch[0].length;
        continue;
      }

      // Match closing tag [/head]
      const closeMatch = text.slice(i).match(/^\[\/head\]/);
      if (closeMatch) {
        closeHandlers.head(openTags, outputParts);
        i += closeMatch[0].length;
        continue;
      }
  
    }

    // default: plain text
    outputParts.push(text[i]);
    i++;
  }

  // close remaining tags at end of document
  while (openTags.length > 0) {
    const tag = openTags.pop();
    if (tag.type === 'head') outputParts.push(`</${tag.tag}>`);
  }

  return outputParts.join('');
}
