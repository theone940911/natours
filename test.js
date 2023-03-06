// const test = 'https://123.mapbox.com'.match(/^https:\/\// && /mapbox.com$/);
// const test = 'https://123.mapbox.com'.match(/^https:\/\//);
// const test = '123.mapbox.com'.match(/mapbox.com$/);
for (let i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 1000);
}

const a = {};
const b = {};
const c = a;

console.log('✨', a === b);
console.log('✨✨', a === c);
