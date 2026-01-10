function parseSS14(text) {
  let output = "";
  let i = 0;

  while (i < text.length) {

    // tag handling here...

    // plain text fallback
    output += text[i];
    i++;
  }

  return output;
}
