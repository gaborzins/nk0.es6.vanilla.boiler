/*
 * Copyright (c) 2016, Coates Group, Pty Ltd.
 * All rights reserved.
 *
 * @Author: gabor.zins@coatesgroup.com
 * 
 * @TODO:    
 *
 */
var gulp 	      = require('gulp'),
    sass	      = require('gulp-sass'),
    clean       = require('gulp-clean'),
    seq 	      = require('gulp-sequence'),
    babel       = require('gulp-babel'),
    uglify      = require('gulp-uglify'),
    streamify   = require('gulp-streamify'),
    glob        = require('glob'),
    browserify  = require('browserify'),
    htmlreplace = require('gulp-html-replace'),
    source      = require('vinyl-source-stream'),
    bsync	      = require('browser-sync').create();

var path = {
  /*
    SOURCE
  */
  // HTML & JSX
  HTML:               './index.html',
  
  // JAVASCRIPT
  ENTRY_POINT:        './src/js/app.js',
  JS:                 './src/js/**/*.js',
  
  // STYLESHEETS
  SCSS:               './src/scss/app.scss',
  
  // IMAGES
  IMG:                './src/assets/img/**/*.png',
  SPRITES:            './src/assets/sprites/*.png',
  SPRITES_BUILD:      './src/assets/sprites/build',
  SPRITES_BUILD_SCSS: './src/assets/sprites/build/sprites.scss',
  SPRITES_BUILD_IMG:  './src/assets/sprites/build/sprites.png',
  
  /*
    DESTINATIONS
  */
  //
  TEMP:                './temp/',
  // DEVELOPMENT
  DEST_BIN:            './bin/',
  // DISTRIBUTION
  DEST_DIST:           './dist/',

  OUT:                 'build.js',
  MINIFIED_OUT:        'build.min.js',
  
  DEST_SRC:            'src/',
  DEST_JS:             'js/',
  DEST_CSS:            'css/',
  DEST_LIB:            'lib/',
  DEST_IMG:            'assets/img',
  DEST_SPRITES:        'assets/sprites',
  DEST_FONTS:          'assets/fonts'
};

gulp.task('serve', function(){
	
  bsync.init({
		server: "./bin"
  });

  gulp.watch([path.JS, path.SCSS], function(event){
  	seq('development-seq')(function(err){
  		if(err) console.log(err);
  	});
  });

  gulp.watch(path.HTML).on('change', function(){
    replaceDevelopHtml();
    bsync.reload();
  });
});

gulp.task('clean-development', function(){
	return  gulp.src(['./bin/**/*', './temp/**/*'], {read:false})
          .pipe(clean({force:true}));
});
gulp.task('clean-production', function(){
  return  gulp.src(['./dist/**/*', './temp/**/*'], {read:false})
          .pipe(clean({force:true}));
});

gulp.task('sass-development', function(){
	return  gulp.src(path.SCSS)
				  .pipe(sass())
				  .pipe(gulp.dest(path.DEST_BIN + path.DEST_SRC + path.DEST_CSS))
				  .pipe(bsync.stream());
});
gulp.task('sass-production', function(){
  return  gulp.src(path.SCSS)
          .pipe(sass())
          .pipe(gulp.dest(path.DEST_DIST + path.DEST_SRC + path.DEST_CSS))
          .pipe(bsync.stream());
});
/* 
    HTML & Templates
*/
// Copy HTML
//
gulp.task('copy-html', function(){
  gulp.src(path.HTML)
    .pipe(gulp.dest(path.DEST));
});
// Replace HTML
//
function replaceProductionHtml(){
  var replacement = {
    'third-party': [
      './src/lib/jquery.min.js', 
      './src/lib/tweenjs-0.6.2.min.js', 
      './src/lib/easeljs-0.8.2.min.js'
    ],
    'build': [
      './src/build.min.js'
    ]
  };
  gulp.src('index.html')
  .pipe(
    htmlreplace(replacement)
  )
  .pipe(gulp.dest('dist/'));
};

function replaceDevelopHtml(){
  var replacement = {
    'third-party': [/*
      './src/lib/jquery.js', 
      './src/lib/tweenjs-0.6.2.combined.js', 
      './src/lib/easeljs-0.8.2.combined.js',
      './src/lib/react.js',
      './src/lib/Flux.js'*/
    ],
    'build': [
      './' + path.DEST_SRC + path.DEST_JS + path.OUT
    ]
  };
  gulp.src(path.HTML)
  .pipe(
    htmlreplace(replacement)
  )
  .pipe(gulp.dest(path.DEST_BIN));
};

gulp.task('build-development', function(){
  glob(path.JS, function(err, files) {
    var tasks = files.map(function(entry) {
      return browserify({ 
        entries: [entry], 
        debug : true
      })
      .transform('babelify', {presets: ['es2015']})
      .bundle()
      .pipe(source(path.OUT))
      .pipe(gulp.dest(path.DEST_BIN + path.DEST_SRC + path.DEST_JS));
    });
  });
});

gulp.task('build-production', function(){
  glob(path.JS, function(err, files) {
    var tasks = files.map(function(entry) {
      return browserify({ 
        entries: [entry], 
        debug : true
      })
      .transform('babelify', {presets: ['es2015']})
      .bundle()
      .pipe(source(path.MINIFIED_OUT))
      .pipe(streamify(uglify()))
      .pipe(gulp.dest(path.DEST_DIST + path.DEST_SRC + path.DEST_JS));
    });
  });
});

/*
  RUN FOR DEVELOPMENT
*/
gulp.task('development-seq', function(cb){
	seq('clean-development', 'build-development', 'sass-development', replaceDevelopHtml)(cb);
});
gulp.task('development', seq('development-seq'));
gulp.task('default', ['serve']);

/*
  RUN FOR DISTRIBUTION
*/
gulp.task('production-seq', function(cb){
  seq('clean-production', 'build-production', 'sass-production')(cb);
});
gulp.task('production', seq('production-seq'));



