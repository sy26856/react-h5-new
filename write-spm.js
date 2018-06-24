let fs = require('fs');
let path = require('path');
let filePath = path.resolve('./src-react');
let cheerio = require('cheerio');

let spmJson = require('./spm.json')

fileDisplay(filePath)
/**
 * 文件遍历方法
 * @param filePath 需要遍历的文件路径
 */

function fileDisplay(filePath){  
    //根据文件路径读取文件，返回文件列表
    fs.readdir(filePath,(err,files)=>{
        let arr = [];//存储所有要找的html文件
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
        arr.forEach((item,index)=>{
            for(let value in spmJson){
                if(item.filename == spmJson[value].html){
                    //将html文件与json对应起来
                        //设置spmb
                    let myHtml = fs.readFileSync(item.filedir);
                    let $ = cheerio.load(myHtml, {decodeEntities: false});
                    if(!$('meta[name=spm-id]').toString()){
                        //没有该标签
                            //需要手动插入
                        let appendTag = `<meta name="spm-id" content="${spmJson[value].spmb}" />`;
                        let html_txt = myHtml.toString('utf-8');
                        let index = html_txt.indexOf('<link');
                        let new_html = html_txt.substr(0,index)+appendTag+'\r\n'+html_txt.substring(index)
                        writeFile(item.filedir,new_html);
                    }else{
                        let old_spmb =  $('meta[name=spm-id]').attr('content');//原来页面的spmb
                        if( old_spmb != spmJson[value].spmb){
                        //原来页面的spmb与json设置的该页面的spmb不一致,需要更新
                        let json_spmb = $('meta[name=spm-id]').attr('content',spmJson[value].spmb);//json设置的该页面的spmb
                        let html_txt = myHtml.toString('utf-8');
                        let reg = /<meta[^>]*>/gi;
                        let list = html_txt.match(reg)
                        for(value of list){
                            let _value = value.replace(/\s+/g, "")
                            if(_value.indexOf('spm-id') != -1){
                                //更新html
                                let new_html = html_txt.replace(value,json_spmb)
                                //写入对应html文件
                                writeFile(item.filedir,new_html)
                                }
                            }
                        }
                    }
                }
            }
    })   

}

//写入内容到相应文件中
function writeFile (filename,html){
    fs.writeFile(filename,
                        html,
                        'utf-8',
                        function(err){
                        if(err){
                            console.log('写入失败')
                        }else{
                            console.log('写入成功')
                        }
                    })
}

