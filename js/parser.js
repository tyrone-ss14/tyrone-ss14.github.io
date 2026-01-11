// ────────────── parser.js ──────────────

// Named colors
const namedColors = {
  Black:"#000000", Red:"#FF0000", DimGray:"#696969", Gray:"#808080",
  White:"#FFFFFF", DarkGreen:"#006400", Blue:"#0000FF", Orange:"#FFA500",
  // add more colors as needed
};

// Default SS14 font size
const SS14_DEFAULT_SIZE = 16;

// Utility: get header font size
function getHeaderSize(level) {
    return Math.ceil(SS14_DEFAULT_SIZE * 2 / Math.sqrt(level));
}

// Main parser
function parseSS14(input) {
    let output = '';
    let pos = 0;
    const stack = [];

    while (pos < input.length) {

        // ESCAPED BRACKETS: \[
        if (input[pos] === '\\') {
            pos++;
            if (input[pos] === '[') {
                output += '[';
                pos++;
                continue; // ✅ stop iteration here
            } else {
                // just a normal backslash
                output += '\\';
                continue;
            }
        }

        // TAG DETECTION
        if (input[pos] === '[') {
            // Try to match an opening or closing tag
            let endTag = input.indexOf(']', pos);
            if (endTag !== -1) {
                const tagContent = input.slice(pos + 1, endTag); // inside [ ]
                pos = endTag + 1; // move cursor past ]

                // Closing tag [/...]
                if (tagContent[0] === '/') {
                    const tagName = tagContent.slice(1).toLowerCase();
                    let tempStack = [];
                    while (stack.length) {
                        const last = stack.pop();
                        // close corresponding HTML
                        if (last.tag === 'bold') output += '</b>';
                        else if (last.tag === 'italic') output += '</i>';
                        else if (last.tag === 'bolditalic') output += '</i></b>';
                        else if (last.tag === 'color') output += '</span>';
                        else if (last.tag === 'head') output += '</span>';
                        else if (last.tag === 'bullet') { /* nothing to close */ }

                        if (last.tag === tagName) break;
                        else tempStack.push(last);
                    }
                    // reopen temporarily closed tags
                    while (tempStack.length) {
                        const reopened = tempStack.pop();
                        switch(reopened.tag) {
                            case 'bold': output += '<b>'; break;
                            case 'italic': output += '<i>'; break;
                            case 'bolditalic': output += '<b><i>'; break;
                            case 'color': output += `<span style="color:${reopened.param}">`; break;
                            case 'head': 
                                const sz = getHeaderSize(reopened.param);
                                output += `<span style="font-size:${sz}px; line-height:0.8; font-weight:${reopened.param==1?'bold':reopened.param==2?'600':'500'}; display:inline; vertical-align:top;">`;
                                break;
                            case 'bullet': output += '• '; break;
                        }
                        stack.push(reopened);
                    }
                    continue;
                }

                // Opening tag
                let tagParts = tagContent.split('=');
                const tag = tagParts[0].toLowerCase();
                const param = tagParts[1] || null;

                switch(tag) {
                    case 'bold': output += '<b>'; stack.push({tag:'bold'}); break;
                    case 'italic': output += '<i>'; stack.push({tag:'italic'}); break;
                    case 'bolditalic': output += '<b><i>'; stack.push({tag:'bolditalic'}); break;
                    case 'color':
                        const hex = namedColors[param] || param || '#000';
                        output += `<span style="color:${hex}">`;
                        stack.push({tag:'color', param:hex});
                        break;
                    case 'head':
                        const lvl = parseInt(param) || 1;
                        const sz = getHeaderSize(lvl);
                        const weight = lvl===1?'bold':lvl===2?'600':'500';
                        output += `<span style="font-size:${sz}px; line-height:0.8; font-weight:${weight}; display:inline; vertical-align:top;">`;
                        stack.push({tag:'head', param:lvl});
                        break;
                    case 'bullet':
                        output += '• ';
                        stack.push({tag:'bullet'});
                        break;
                    default:
                        // unknown tag: ignore
                        break;
                }
                continue;
            }
        }

        // DEFAULT: just output character
        output += input[pos];
        pos++;
    }

    // CLOSE ANY REMAINING TAGS
    while (stack.length) {
        const last = stack.pop();
        if (last.tag === 'bold') output += '</b>';
        else if (last.tag === 'italic') output += '</i>';
        else if (last.tag === 'bolditalic') output += '</i></b>';
        else if (last.tag === 'color') output += '</span>';
        else if (last.tag === 'head') output += '</span>';
        else if (last.tag === 'bullet') { /* nothing to close */ }
    }

    return output;
}
