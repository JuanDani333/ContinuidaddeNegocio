const bcrypt = require("bcryptjs");

const password = process.argv[2];

if (!password) {
  console.log("Uso: node generateHash.js <tu-contraseña>");
  process.exit(1);
}

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("---------------------------------------------------");
  console.log("Contraseña:", password);
  console.log("Hash (copia esto a tu BD):", hash);
  console.log("---------------------------------------------------");
});
