const ptr = require('./backend/node_modules/path-to-regexp');
const pathToRegexp = typeof ptr === 'function' ? ptr : ptr.pathToRegexp || ptr.default;

function testPattern(pattern, paths) {
  console.log(`\nTesting pattern: "${pattern}"`);
  try {
    const keys = [];
    const rex = pathToRegexp(pattern, keys);
    console.log('Compiled Regex:', rex);
    for (const p of paths) {
      const match = rex.exec(p);
      console.log(`  "${p}" => ${match ? 'MATCH' : 'NO MATCH'}`);
    }
  } catch (err) {
    console.log('ERROR compiling pattern:', err.message);
  }
}

const paths = [
  '/questions',
  '/post/6a6099d3443f0eb280863631',
  '/question/6a619aee05be94ca8938f78e',
  '/assets/index.js',
  '/favicon.ico',
  '/api/posts',
];

if (pathToRegexp) {
  testPattern('/:path([^.]*)', paths);
  testPattern('/:path((?!api|assets|favicon.ico)[^.]*)', paths);
  testPattern('/((?!api|assets|favicon.ico)[^.]*)', paths);
}
