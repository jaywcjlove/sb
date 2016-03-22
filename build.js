var fs      = require("fs");
var path    = require('path');

//检查指定路径的文件或者目录是否存在
function exists(_path){
    return fs.existsSync(_path);
}

//判断是不是文件
function isFile(_path){
    return exists(_path) && fs.statSync(_path).isFile();  
} 

//判断是不是目录
function isDir(_path){
    return exists(_path) && fs.statSync(_path).isDirectory();  
}


var path_root = process.cwd();
var data = {};

// 初始化数据
initData(path_root)
function initData(dirname){
    var files = fs.readdirSync(dirname);
    var filesArr = []
    files.forEach(function(_filename,idx){
        _filepath = path.join(dirname,_filename)
        if( _filename !== '.git' && _filename !== 'svg' && _filename !== '.DS_Store'){
            if(isDir(_filepath)){
                data[_filename] = initData(_filepath);
            }else if(isFile(_filepath)){
                filesArr.push(_filepath.replace(path_root,'').replace('/',''))
            }
        }
    })
    return filesArr
}
// 这里没什么卵用
fs.writeFileSync(path.join(path_root, 'data.json'), JSON.stringify(data,null,4));


var html_str = fs.readFileSync(path.join(path_root,'template.html'), 'utf8');
var UL_str = '';

var svg_total = 0;
for(var a in data){
    UL_str += '  <h2 class="title">'+a+'</h2>\n';
    UL_str += '  <ul>\n';
    if(data[a].length>0){
        svg_total += data[a].length;
        for (var i = 0; i < data[a].length; i++) {
            UL_str += '    <li><img src="'+data[a][i]+'" /></li>\n'
        }
    }
    UL_str += '  </ul>\n';
}
console.log('\n => 共有' + svg_total + '个SVG文件');

fs.writeFileSync(path.join(path_root, 'index.html'), html_str.replace('{{content}}',UL_str));
console.log("\n写入文件ok!!\n");