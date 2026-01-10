// parser.js - robust SS14 parser

// Mapping of header levels to CSS tag
const HEADER_TAGS = {
  1: 'h1',
  2: 'h2',
  3: 'h3'
};

// Allowed colors (HTML names)
const ALLOWED_COLORS = [
  "Black","DimGray","Gray","DarkGray","Silver","LightGray","Gainsboro",
  "White","RosyBrown","IndianRed","Brown","Firebrick","DarkRed","Red",
  "OrangeRed","Tomato","Coral","DarkOrange","Orange","Gold","Yellow",
  "Olive","YellowGreen","GreenYellow","Chartreuse","LawnGreen","Green",
  "DarkGreen","SeaGreen","MediumSeaGreen","LightSeaGreen","Teal",
  "DarkCyan","Aqua","Cyan","DeepSkyBlue","DodgerBlue","RoyalBlue",
  "Blue","DarkBlue","Navy","Indigo","Purple","DarkMagenta","Magenta",
  "Fuchsia","HotPink","Pink","LightPink"
];

// Token regex patterns
const TAG_REGEX = /\[(\/?)(head|bolditalic|bold|italic|color|bullet)(?:=([^\]]+))?\]/i;
const ESCAPE_REGEX = /\\(\[)/g;
const HIDDEN_REGEX = /\[\]/g;

// Main parser function
function parseSS14(input) {
  // Escape handling: show \[ as literal [
  input = input.replace(ESCAPE_REGEX, '$1');

  let output = '';
  let pos = 0;
  const stack = []; // tracks open tags: {type, extra info}

  while (pos < input.length) {
    const rest = input.slice(pos);

    // Hidden [] - just skip
    const hiddenMatch = rest.match(HIDDEN_REGEX);
    if (hiddenMatch && hiddenMatch.index === 0) {
      pos += 2;
      continue;
    }

    // Match tags
    const tagMatch = rest.match(TAG_REGEX);
    if (tagMatch && tagMatch.index === 0) {
      const [, closing, tag, value] = tagMatch;

      if (!closing) {
        // OPENING TAG
        switch(tag.toLowerCase()) {
          case 'head': {
            const level = parseInt(value, 10) || 1;
            const tagName = HEADER_TAGS[level] || 'h1';
            output += `<${tagName}>`;
            stack.push({ type: 'head', tag: tagName });
            break;
          }
          case 'bold': {
            output += `<b>`;
            stack.push({ type: 'bold' });
            break;
          }
          case 'italic': {
            output += `<i>`;
            stack.push({ type: 'italic' });
            break;
          }
          case 'bolditalic': {
            output += `<b><i>`;
            stack.push({ type: 'bolditalic' });
            break;
          }
          case 'color': {
            const colorName = ALLOWED_COLORS.includes(value) ? value : 'Black';
            output += `<span style="color:${colorName}">`;
            stack.push({ type: 'color' });
            break;
          }
          case 'bullet': {
            output += `• `; // simple bullet
            break;
          }
        }
      } else {
        // CLOSING TAG
        switch(tag.toLowerCase()) {
          case 'head':
          case 'bold':
          case 'italic':
          case 'bolditalic':
          case 'color': {
            // Pop from stack
            for (let i = stack.length - 1; i >= 0; i--) {
              const s = stack[i];
              if (
                (tag.toLowerCase() === 'bolditalic' && s.type === 'bolditalic') ||
                (tag.toLowerCase() === s.type)
              ) {
                if (s.type === 'head') output += `</${s.tag}>`;
                else if (s.type === 'bolditalic') output += `</i></b>`;
                else if (s.type === 'bold') output += `</b>`;
                else if (s.type === 'italic') output += `</i>`;
                else if (s.type === 'color') output += `</span>`;
                stack.splice(i, 1);
                break;
              }
            }
            break;
          }
        }
      }

      pos += tagMatch[0].length;
      continue;
    }

    // Normal character
    output += input[pos];
    pos++;
  }

  // Close any remaining open tags
  while (stack.length > 0) {
    const s = stack.pop();
    if (s.type === 'head') output += `</${s.tag}>`;
    else if (s.type === 'bolditalic') output += `</i></b>`;
    else if (s.type === 'bold') output += `</b>`;
    else if (s.type === 'italic') output += `</i>`;
    else if (s.type === 'color') output += `</span>`;
  }

  return output;
}
