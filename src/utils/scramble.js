function scramble(str) {
  let arr = [...str];
  do {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  } while (arr.join('') === str && arr.length > 1);
  return arr.join('');
}

module.exports = { scramble };
