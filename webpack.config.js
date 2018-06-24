var fs = require("fs")
var webpack = require("webpack")
var version  = require('./package.json').version;
var smart_ui_version = require('./package.json').smart_ui_version;

var HtmlWebpackPlugin = require("html-webpack-plugin");
var HtmlWebpackPlugin2 = require('./HtmlWebpackPlugin2');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var dllConfig = require("./webpack.config.dll");
var path = require("path");
const SpritesmithPlugin = require('webpack-spritesmith');

//当前环境 daily  dist
//cross-env NODE_ENV=dist webpack
var environment = process.env.NODE_ENV || "dev" // daily dev dist
var dev_environment = environment.indexOf("dev") != -1; // 本地开发环境 webpack dev
var daily_environment = environment.indexOf("daily") != -1; // daily环境 webpack daily
var dist_environment = environment.indexOf("dist") != -1; // 生产环境 webpack dist

//源文件目录
var rootPath = "./src-react/";
//发布文件目录
var distPath = "./build";

var daily_cdn_domain = "daily.yuantutech.com"
var dist_cdn_domain = "s.yuantutech.com"

var cnd_domain = daily_environment || dev_environment ? daily_cdn_domain : dist_cdn_domain;
//cdn
var daily_publicPath = "//daily.yuantutech.com/yuantu/h5-cli/"+version+"/";
var dist_publicPath = "//s.yuantutech.com/yuantu/h5-cli/"+version+"/";


//本地开发环境通常不需要配置
var dev_publicPath = null;


var publicPath = daily_environment ? daily_publicPath : (dist_environment ? dist_publicPath : dev_publicPath);

var extractLESS = new ExtractTextPlugin('all.css');

//spritesmith雪碧图插件css自定义模版配置
const templateFunction = function (data) {
  var perSprite = data.sprites.map(function (sprite) {
      return '.sprite-N { background: url(I) no-repeat Xpx Ypx;width: Wpx; height: Hpx;background-size:100%}'
          .replace('I', sprite.image)
          .replace('N', sprite.name)
          .replace('W', sprite.width)
          .replace('H', sprite.height)
          .replace('X', sprite.offset_x)
          .replace('Y', sprite.offset_y);
  }).join('\n');
  return perSprite;
}


//读取.js文件作为入口
var entry = {};
fs.readdirSync(rootPath).map(function(item){
  if(/\.js$/.test(item)){
    entry[item.replace(".js", "")] = [rootPath+"/"+item]
  }
});


var config = {

    /**
    babel-polyfill' 可让浏览器支持最新的语法和扩展方法，比如 Object.assign 方法
    entry: ['babel-polyfill','./src/index.js'],
    */
     // entry:{
     //   main:["./src/main.js"],
     //   index:["./src/index.js"],
     //   test:["./src/test.js"]
     // },
     entry:{
      app:[`./${rootPath}/app.js`]
     },
     output: {
       path:path.resolve(__dirname, distPath),
       publicPath:publicPath,
       filename: '[name].bundle.js'
     },
     module:{
      loaders: [
        {
          test: /\.js$/,
          /**
            excule必须写一个目录不然会发出一个警告
          */
          exclude:path.resolve(__dirname, 'node_modules/'),
          /**
            babel-loader  需要配置 .babelrc
          */
          loader:'babel',
          query: {

              // 不适用  async await 函数可以不要  transform-runtime 和 stage-3
              presets: ['react','es2015','stage-1'],
              plugins: ["transform-decorators-legacy", 'transform-runtime'],//,'transform-runtime'

              //打包速度更快
              cacheDirectory: true
          }
        },
        {test: /\.ttf$/, loader: "file-loader" },
        {
          test: /\.(less|css)$/,
          /**
            css-loader less-loader autoprefixer
            extractLESS.extract 独立打包 css文件
            ['css','less','autoprefixer'] ==> ['css-loader','less-loader','autoprefixer-loader'] 的简写
          */
          loader:extractLESS.extract(['css','less','postcss','autoprefixer'])
        },
        {  
          test: /\.(jpeg|jpg|png|gif|svg)$/,  
          loader: 'url-loader?limit=102400&name=[path][name].[ext]',  
      }
    ]
    },
     plugins: [
      extractLESS,
      new webpack.DllReferencePlugin({
       context: __dirname,
       manifest: require('./manifest.json'),
      }),
      new SpritesmithPlugin({
        src: {
            cwd: path.resolve(__dirname, './src-react/sprite'),
            glob: '*.png'
        },
        target: {
            image: path.resolve(__dirname, './src-react/assets/sprite.png'),
            css: [
                [path.resolve(__dirname, './src-react/assets/sprite.css'),
                {format: 'function_based_template'}]
            ]
        },
        apiOptions: {
            cssImageRef: './sprite.png'
        },
        spritesmithOptions: {
            algorithm: 'top-down',
        },
        customTemplates: {
          'function_based_template': templateFunction,
      },
    })
    ]
 }



/**
  多入口的的配置
  js文件名和html文件名一一对应
  比如
    index.js
    index.html
    main.js
    main.html
*/

// 修改 HtmlWebpackPlugin  插件，直接插入到html中的文件
var addAssetTags = [
  {
    tagName: 'script',
    closeTag: true,
    attributes: {
      type: 'text/javascript',
      src:(function(){
        //本地调试
        if(dev_environment ){
          return  `//s.yuantutech.com/yuantu/h5-cli/1.4.29/vendor.js`
        }
        //uat daily发布
        if(daily_environment){
          return  `//s.yuantutech.com/yuantu/h5-cli/1.4.29/vendor.js`
        }
        //线上发布
        if(dist_environment){
          return  `//s.yuantutech.com/yuantu/h5-cli/1.4.29/vendor.js`
        }
      })()
    }
  }
];
//插入到最后的JS
var addAfterTags = [
  {
    tagName: 'script',
    closeTag: true,
    attributes: {
      type: 'text/javascript',
      async:"async",
      src:"https://s.yuantutech.com/yuantu/spm/1.0.22/??spm.js,track.js,view.js"
    }
  },
  //腾讯的埋点服务
  {
    tagName:"script",
    closeTag:true,
    attributes:{
      type: 'text/javascript',
      async:"async",
      name:"MTAH5",
      sid:"500002222",
      src:"https://pingjs.qq.com/h5/stats.js?v2.0.4"
    }
  }
];



//把自定义的 addAssetTags 添加到html中
HtmlWebpackPlugin2.prototype.injectAssetsIntoAssetTags = function(assetTags) {
  // body...
  assetTags.body = addAssetTags.slice(0).concat(assetTags.body);
  assetTags.body = assetTags.body.concat(addAfterTags);//addAfterTags.slice(0).concat(assetTags.body);
  return assetTags;
};


//打包的时候把静态资源打包进去
Object.keys(entry).map(function(key){
  if( fs.existsSync( path.resolve(rootPath, `${key}.html`) )){
    console.log(`ADD entry ${key}.html`);
    config.plugins.push(
      new HtmlWebpackPlugin2({
          filename:path.resolve(distPath, `${key}.html`),
          template:path.resolve(rootPath, `${key}.html`),
          inject:true,
          hash:false,
          cache:true,
          //要插入什么内容
          chunks:['app'],
          minify:{
            removeComments:false,
            collapseWhitespace:false
          },
          //HtmlWebpackPlugin2 实现了变量插入
          variable:{
            cnd_domain:cnd_domain,
            smart_ui_version:smart_ui_version
          }
      })
    )
  }
});

//线上打包需要压缩代码
if(dist_environment||daily_environment){
  config.plugins.unshift(
      new webpack.optimize.UglifyJsPlugin({
          compress: {
              warnings: false
          },
          mangle:false
      })
    )
}

/**
  热加载需要的两个插件
*/
if(dev_environment){
  config.plugins.push(new webpack.HotModuleReplacementPlugin())
  config.plugins.push(new webpack.NoErrorsPlugin({"process.env.NODE_ENV":"development"}))
}

module.exports = config;