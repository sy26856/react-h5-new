var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
// var clean = require("gulp-clean");
var n2a = require("gulp-native2ascii");
var gulpless = require('gulp-less');
var cssmin = require("gulp-cssmin");
var jsmin = require('gulp-jsmin');
// var Amdclean = require('gulp-amdclean');
// var connect = require('gulp-connect');
// var copy = require("gulp-copy2");
var essi = require("essi");
var babel = require('gulp-babel');
var gulpLocalServer = require("gulp-local-server");
var autoprefixer = require("gulp-autoprefixer");
var version = require("./package.json").version;
var cdnPath = "//s.yuantutech.com/yuantu/h5-cli/";
var devcdnPath = "//daily.yuantutech.com/yuantu/h5-cli/";
var config_dir = __dirname;

gulp.task('jsmin', function(){

	return gulp.src(["src/**/*.js"])
	//压缩文件
	//中文处理
	.pipe(n2a(
		{
			reverse:false
		}
	))
	.pipe( jsmin() )
	.pipe(gulp.dest("build/"))
})

// seajs 不能使用babel 会报错
gulp.task('babel-min', function(){
	return gulp.src(["src/**/*.js","!src/libs/sea.js","!src/libs/console.js","!src/libs/juicer.js"])
	.pipe(babel({
		presets: ['es2015']
	}))
	//中文处理
	.pipe(n2a(
		{
			reverse:false
		}
	))
	.pipe( jsmin() )
	.pipe(gulp.dest("build/"))
})


gulp.task('jscopy', function(){
	return gulp.src(["src/**/*.js"])
	.pipe(gulp.dest("build/"))
})

// seajs 不能使用babel 会报错
gulp.task('babel', function(){
	return gulp.src(["src/**/*.js","!src/libs/sea.js","!src/libs/console.js","!src/libs/juicer.js"])
	//中文处理
	.pipe(babel({
		presets: ['es2015']
	}))
	.pipe(n2a(
		{
			reverse:false
		}
	))
	.pipe(gulp.dest("build/"))
})

gulp.task('cssmin', function(){

	return gulp.src("src/**/*.less")
	.pipe(gulpless())
	.pipe(autoprefixer({ browsers: ['> 5%'] }))
	//压缩文件
	.pipe(cssmin())
	.pipe(rename(function(path){
		path.extname = ".css";
	}))
	.pipe(gulp.dest("build/"))
});


gulp.task('csscopy', function(){

	return gulp.src("src/**/*.less")
	.pipe(gulpless())
	.pipe(autoprefixer({ browsers: ['> 5%'] }))
	.pipe(rename(function(path){
		path.extname = ".css";
	}))
	.pipe(gulp.dest("build/"))
});



	// .pipe(autoprefixer())

gulp.task("html", function() {
  return gulp.src(["./src/**/*.html"])
    .pipe(essi.gulp({
      strictPage: true,
      cdnPath: cdnPath,
      version: version,
      replaces:{
      	"__version__":version
      }
    }, config_dir))
    .pipe(gulp.dest("./build"));
});


gulp.task("htmldev", function() {
  return gulp.src(["./src/**/*.html"])
    .pipe(essi.gulp({
      strictPage: true,
      cdnPath: devcdnPath,
      version: version,
      replaces:{
      	"__version__":version
      }
    }, config_dir))
    .pipe(gulp.dest("./build"));
});


gulp.task("copy", function(){
	return gulp.src("src/font/*")
	.pipe(gulp.dest("build/font/"));
})


gulp.task('lint', function() {
  return gulp.src('./src/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('YOUR_REPORTER_HERE'));
});

gulp.task('dev-build',['htmldev','jscopy','babel','csscopy', 'copy']);

gulp.task('default',function(){
	console.error("请使用 npm run dev")
});


gulp.task("dev", function(){
	gulpLocalServer(8088, '/src');
});

gulp.task("dist", ['html','jscopy','babel','cssmin','copy']);
