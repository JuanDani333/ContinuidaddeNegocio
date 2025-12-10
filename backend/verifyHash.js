const bcrypt = require('bcryptjs');

const password = process.argv[2];
const hash = process.argv[3];

if (!password || !hash) {
  console.log('Uso: node verifyHash.js <password> <hash>');
  process.exit(1);
}

console.log('Verificando...');
console.log('Password:', password);
console.log('Hash:', hash);

bcrypt.compare(password, hash).then(res => {
  console.log('Match Result:', res); // true or false
}).catch(err => console.error(err));
