// ────────────── parser.js ──────────────
// SS14 Document Parser - Clean & Robust

// Named colors
const namedColors = {
    Black:"#000000", DimGray:"#696969", Gray:"#808080", White:"#FFFFFF",
    Red:"#FF0000", DarkRed:"#8B0000", Green:"#00FF00", Blue:"#0000FF",
    Yellow:"#FFFF00", Orange:"#FFA500", Purple:"#800080",
    // add more colors as needed
};

// Default SS14 font size
const SS14_DEFAULT_SIZE = 16;

// Compute header size like SS14
function getHeaderSize(level) {
    return Math.ceil(SS14_DEFAULT_SIZE * 2 / Math.sqrt(level));
}

// Main parser
function parseSS14(input) {
    let output = '';
    let pos = 0;
    const stack = []; // keeps track of open tags

    while (pos < input.length) {
        const ch = input[pos];

        // ESCAPED BRACKETS
        if (ch === '\\') {
            pos++;
            if (input[pos] === '[') { output += '['; pos++; continue; }
            if (input[pos] === ']') { output += ']'; pos++; continue; }
            output += '\\'; // normal backslash
            continue;
        }

        // TAG DETECTION
        if (ch === '[') {
            let end = input.indexOf(']', pos);
            if (end === -1) {
                output += ch; // unmatched [ -> output as-is
                pos++;
                continue;
            }

            const content = input.slice(pos+1, end);
            pos = end + 1; // move past ]

            // Closing tag [/tag]
            if (content.startsWith('/')) {
                const tagName = content.slice(1).toLowerCase();
                let tempStack = [];
                while (stack.length) {
                    const last = stack.pop();
                    // Close HTML
                    if (last.tag === 'bold') output += '</b>';
                    else if (last.tag === 'italic') output += '</i>';
                    else if (last.tag === 'bolditalic') output += '</i></b>';
                    else if (last.tag === 'color') output += '</span>';
                    else if (last.tag === 'head') output += '</span>';
                    else if (last.tag === 'bullet') { /* no closing */ }

                    if (last.tag === tagName) break;
                    else tempStack.push(last);
                }
                // reopen temporarily closed tags
                while (tempStack.length) {
                    const r = tempStack.pop();
                    switch(r.tag){
                        case 'bold': output += '<b>'; break;
                        case 'italic': output += '<i>'; break;
                        case 'bolditalic': output += '<b><i>'; break;
                        case 'color': output += `<span style="color:${r.param}">`; break;
                        case 'head':
                            const sz = getHeaderSize(r.param);
                            const weight = r.param===1?'bold':r.param===2?'600':'500';
                            output += `<span style="font-size:${sz}px; line-height:0.8; font-weight:${weight}; display:inline; vertical-align:top;">`;
                            break;
                        case 'bullet': output += '• '; break;
                    }
                    stack.push(r);
                }
                continue;
            }

            // Opening tag
            let [tag, param] = content.split('=');
            tag = tag.toLowerCase();

            switch(tag){
                case 'bold': output += '<b>'; stack.push({tag:'bold'}); break;
                case 'italic': output += '<i>'; stack.push({tag:'italic'}); break;
                case 'bolditalic': output += '<b><i>'; stack.push({tag:'bolditalic'}); break;
                case 'color':
                    const hex = namedColors[param] || param || '#000';
                    output += `<span style="color:${hex}">`;
                    stack.push({tag:'color', param:hex}); break;
                case 'head':
                    const lvl = parseInt(param)||1;
                    const sz = getHeaderSize(lvl);
                    const weight = lvl===1?'bold':lvl===2?'600':'500';
                    output += `<span style="font-size:${sz}px; line-height:0.8; font-weight:${weight}; display:inline; vertical-align:top;">`;
                    stack.push({tag:'head', param:lvl}); break;
                case 'bullet':
                    output += '• '; stack.push({tag:'bullet'}); break;
                default:
                    // Unknown tag -> ignore
                    break;
            }
            continue;
        }

        // HIDDEN BRACKETS [stuff] without \ -> disappear
        if (ch === '[') {
            const end = input.indexOf(']', pos);
            if (end !== -1) { pos = end+1; continue; }
        }

        // DEFAULT: normal character
        output += ch;
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
        // bullet has no closing tag
    }

    return output;
}
