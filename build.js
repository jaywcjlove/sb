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
      if (_filename !== '.git' && _filename !== '.github' && _filename !== 'svg' && _filename !== '.DS_Store') {
        if (isDir(_filepath)) {
          data[_filename] = await initData(_filepath);
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
  fs.writeFileSync(path.join(path_root, 'data.json'), JSON.stringify(data, null, 4));


  let ulStr = '';
  let svgTotal = 0;

  Object.keys(data).forEach((keyName) => {
    ulStr += `  <h2 class="title">${keyName}</h2>\n`;
    ulStr += '  <ul>\n';
    if (data[keyName].length > 0) {
      svgTotal += data[keyName].length;
      data[keyName].forEach((item) => {
        ulStr += `    <li><img src="${item}" /></li>\n`;
      });
    }
    ulStr += '  </ul>\n';
  });
  console.log('\n => 共有' + svgTotal + '个SVG文件');
  const htmlStr = fs.readFileSync(path.join(path_root, 'template.html'), 'utf8');
  fs.writeFileSync(path.join(path_root, 'index.html'), htmlStr.replace('{{content}}', ulStr));
  console.log("\n写入文件ok!!\n");
})();