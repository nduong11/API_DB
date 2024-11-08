const fs = require('fs');
let data = fs.readFileSync('database.json', 'utf8');
data = JSON.parse(data)
console.log(data["FirstDB"]["Users"]);