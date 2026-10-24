'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const { createExtractorFromData } = require('node-unrar-js');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const manifest = require('../.github/website-source.json');
const blobSha = content => crypto.createHash('sha1').update(Buffer.from('blob ' + content.length + '\0')).update(content).digest('hex');

async function main() {
  const archive = fs.readFileSync(path.join(root, 'linien-website.rar'));
  const archiveSha = crypto.createHash('sha256').update(archive).digest('hex');
  if (archiveSha !== '46fcdd8d4d26109282490e0f5c5fc27aab863fcc146dba0effa907f686eb64ca') throw new Error('Original source archive changed');
  const expected = new Map(manifest.map(f => [f.path.replace(/^public\//, ''), f.sha]));
  const files = new Map();
  const extractor = await createExtractorFromData({data: Uint8Array.from(archive).buffer});
  for (const file of extractor.extract().files) {
    const name = file.fileHeader.name.replaceAll('\\', '/');
    if (file.fileHeader.flags.directory) continue;
    const relative = name.startsWith('linien-website/') ? name.slice('linien-website/'.length) : '';
    if (expected.has(relative) && file.extraction) files.set(relative, Buffer.from(file.extraction));
  }
  for (const [relative, sha] of expected) {
    if (!files.has(relative)) files.set(relative, fs.readFileSync(path.join(root, 'public', relative)));
    if (blobSha(files.get(relative)) !== sha) throw new Error('Original material mismatch: ' + relative);
  }
  // Editable page sources stay in the repository root; the archive supplies original imagery.
  for (const name of ['index.html', 'style.css', 'app.js', 'data.js']) files.set(name, fs.readFileSync(path.join(root, name)));
  new vm.Script(files.get('app.js').toString('utf8'));
  const sandbox = {window:{}};
  vm.runInNewContext(files.get('data.js').toString('utf8'), sandbox);
  const {products, specs} = sandbox.window.LINIEN;
  const references = new Set([...files.get('index.html').toString('utf8').matchAll(/(?:src|href)="([^"#]+)"/g)].map(m => m[1]));
  for (const p of products) for (const image of [p.image, ...p.gallery]) references.add(image);
  for (const ref of references) if (!/^(https?:|data:|mailto:|tel:)/.test(ref) && !files.has(ref)) throw new Error('Missing resource: ' + ref);
  for (const [relative, content] of files) {
    const target = path.resolve(output, relative);
    if (!target.startsWith(output + path.sep)) throw new Error('Unsafe output path');
    fs.mkdirSync(path.dirname(target), {recursive:true});
    fs.writeFileSync(target, content);
  }
  console.log(`Built ${files.size} verified website files: ${products.length} product collections and ${specs.length} specifications.`);
}
main().catch(error => {console.error(error.message); process.exitCode = 1;});
