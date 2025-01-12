const fs = require('fs');
const path = require('path');

//检查指定路径的文件或者目录是否存在
function exists(_path) {
  return fs.existsSync(_path);
}

//判断是不是文件
function isFile(_path) {
  return exists(_path) && fs.statSync(_path).isFile();
}

//判断是不是目录
function isDir(_path) {
  return exists(_path) && fs.statSync(_path).isDirectory();
}

const path_root = process.cwd();
const data = {};

function initData(dirname) {
  return new Promise((resolve, reject) => {
    const files = fs.readdirSync(dirname);
    const filesArr = []
    files.forEach(async (_filename, idx) => {
      _filepath = path.join(dirname, _filename)
      if (_filename !== '.git' && _filename !== '.github' && _filename !== 'www' && _filename !== 'svg' && _filename !== '.DS_Store') {
        if (isDir(_filepath)) {
          data[_filename] = (await initData(_filepath)).sort((a, b) => {
            const regex = /(\d+)|(\D+)/g;
            
            const aParts = a.match(regex);
            const bParts = b.match(regex);
            
            for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
                const aPart = aParts[i];
                const bPart = bParts[i];
                
                // Compare numbers as numbers
                if (!isNaN(aPart) && !isNaN(bPart)) {
                    const diff = parseInt(aPart, 10) - parseInt(bPart, 10);
                    if (diff !== 0) {
                        return diff;
                    }
                }
                
                // Compare text parts alphabetically
                if (aPart !== bPart) {
                    return aPart.localeCompare(bPart);
                }
            }
            
            // If one is a prefix of the other, the shorter one should come first
            return aParts.length - bParts.length;
          });
        } else if (isFile(_filepath)) {
          filesArr.push(_filepath.replace(path_root, '').replace('/', ''))
        }
      }
    });
    resolve(filesArr)
  });
}

; (async () => {
  await initData(path_root);
  fs.writeFileSync(path.join(path_root, 'data.json'), JSON.stringify(data, null, 2));

  let ulStr = '';
  let svgTotal = 0;
  let markdownStr = '';

  Object.keys(data).forEach((keyName) => {
    markdownStr += `\n\n## ${keyName}\n\n`;
    ulStr += `  <h2 class="title">${keyName}</h2>\n`;
    ulStr += '  <ul>\n';
    if (data[keyName].length > 0) {
      svgTotal += data[keyName].length;
      data[keyName].forEach((item) => {
        ulStr += `    <li><a href="${item}" target="__blank"><img src="${item}" /></a></li>\n`;
        markdownStr += `[![${item}](https://jaywcjlove.github.io/sb/${item})](https://jaywcjlove.github.io/sb/${item}) `;
      });
    }
    ulStr += '  </ul>\n';
  });
  console.log();
  console.log(` => 共有 \x1b[32;1m${svgTotal}\x1b[0m 个 SVG 文件`);
  const htmlStr = fs.readFileSync(path.join(path_root, 'template.html'), 'utf8');
  fs.writeFileSync(path.join(path_root, 'www', 'index.html'), htmlStr.replace('{{content}}', ulStr));
  console.log(" => 写入文件 ok!!");
  console.log();
  const mdStr = fs.readFileSync(path.join(path_root, 'README.md'), 'utf8');
  fs.writeFileSync(path.join(path_root, 'README.md'), mdStr.replace(/<!--icon-start-->([\s\S]*?)?<!--icon-end-->/g, `<!--icon-start-->${markdownStr}<!--icon-end-->`));
})();