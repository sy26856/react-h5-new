let fs = require('fs');
let path = require('path');
let filePath = path.resolve('./src-react');
let cheerio = require('cheerio');//相当与jq的作用

fileDisplay(filePath)
/**
 * 文件遍历方法
 * @param filePath 需要遍历的文件路径
 */

function fileDisplay(filePath){  
    //根据文件路径读取文件，返回文件列表
    fs.readdir(filePath,(err,files)=>{
        let arr = [];
        if(err){console.warn(err)}else{
            //遍历读取到的文件列表
            files.forEach((filename,index)=>{
                //获取当前文件的绝对路径
                let filedir = path.join(filePath,filename);
                //根据文件路径获取文件信息，返回一个fs.Stats对象
                let stats = fs.statSync(filedir); //同步读取文价
                if(stats.isFile()&&/\.html$/.test(filename)){//是html文件
                    arr.push({filedir:filedir,filename:filename})
                }
            })
           
        }
        option(arr)
    })
}

//读取到html文件核心业务
function option(arr){
    let list = []
        arr.forEach((item)=>{
            let myHtml = fs.readFileSync(item.filedir);
            let $ = cheerio.load(myHtml, {decodeEntities: false});
            let title = $('title').text();//拿到title
            if(!$('meta[name=spm-id]').toString()){
                //说明没有这个这个标签
                let _content= {name:title?title:'  ',html:item.filename,spmb:' '};
                list.push(_content)
            }else{
                //有设置这个标签
                    //有可能content有值,也有可能没有值
                let spmb = $('meta[name=spm-id]').attr('content');//拿到content
                let _content= {name:title?title:'  ',html:item.filename,spmb:spmb?spmb:0};
                list.push(_content)
            }
    })   
        //list排序处理
            //方便查看哪些spm被占用
        let compare = function (obj1, obj2) {
        let val1 = obj1.spmb;
        let val2 = obj2.spmb;
        if (val1 < val2) {
                return -1;
            } else if (val1 > val2) {
                return 1;
            } else {
                return 0;
            }            
        } 
        let _list = list.sort(compare)
        let transformArr = ''
        let spmJson = {}
        //将排序后的数组格式化我们想要的格式,写入文件中
        _list.forEach((item)=>{
                let content = item.name+'|'+item.html+'|'+item.spmb
                //清空
                clear()
                //追加到spm.txt文件
                appendFileSync(transformArr += '\r\n'+content)
                //写入spm.json内容
                let name = item.html.replace('.html','')
                spmJson[name] = {
                    html:item.html,
                    spmb:item.spmb
                }
        })   
        //写入spm.json
        writeFile(JSON.stringify(spmJson))

} 


//清空spm.txt文件内容
function clear(){
    fs.writeFile('./spm.text','','utf-8',function(err){
        if(err){
            console.log('清空失败')
        }else{
            console.log('清空成功')
        }
    })
}

//追加内容到spm.txt
function appendFileSync (content){
    fs.appendFileSync('spm.text',
                        content,
                        'utf-8',
                        function(err){
                        if(err){
                            console.log('写入失败')
                        }else{
                            console.log('写入成功')
                        }
                    })
}

//写入内容到spm.json
function writeFile (content){
    fs.writeFile('spm.json',
                        content,
                        'utf-8',
                        function(err){
                        if(err){
                            console.log('写入失败')
                        }else{
                            console.log('写入成功')
                        }
                    })
}

