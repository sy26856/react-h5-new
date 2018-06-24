var rf = require('fs');

var packageJson = rf.readFileSync("./package.json", 'utf-8');
var seajsConfig = rf.readFileSync("./src/config.js", 'utf-8');

var packageValue = JSON.parse(packageJson);

rf.writeFileSync('./h5-version.js', `export default "${packageValue.version}"`, 'utf-8')
rf.writeFileSync('./src/config.js', seajsConfig.replace(/version:(.*),/, `version: "${packageValue.version}",`), 'utf-8');