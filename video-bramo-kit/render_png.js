const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const folder = __dirname;
async function render() {
  const inputs = fs.readdirSync(folder).filter(name => name.endsWith('.svg'));
  for (const name of inputs) {
    const source = fs.readFileSync(path.join(folder, name));
    await sharp(source).png().toFile(path.join(folder, name.replace(/\.svg$/, '.png')));
  }
  console.log(`Rendered ${inputs.length} PNG visual references at 1280x720.`);
}
render().catch(error => { console.error(error); process.exitCode = 1; });
