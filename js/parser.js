function parseSS14(input) {
  let output = '';
  let pos = 0;

  while (pos < input.length) {
    if (input[pos] === '\\') {
      pos++;
      if (input[pos] === '[') {
        output += '[';
        while (pos < input.length) {
          pos++;
          if (input[pos] === ']') {
            output += ']';
            pos++;
            break;
          }
          output += input[pos];
        }
        continue;
      }
      output += '\\';
      continue;
    }
    output += input[pos];
    pos++;
  }
  return output;
}
