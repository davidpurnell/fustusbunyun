//core packages
var gulp = require('gulp-help')(require('gulp'),['hideDepsMessage']);
var sass = require('gulp-sass');
var del = require('del');
var concat = require('gulp-concat');
//rsync and deps
var rsync = require('gulp-rsync');
var log = require('fancy-log');
var colors = require('ansi-colors');
var PluginError = require('plugin-error');
var prompt = require('gulp-prompt');
var gulpif = require('gulp-if');
var argv = require('minimist')(process.argv);
//processing, cleaning, minifying
var sourcemaps = require('gulp-sourcemaps');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var uglify = require('gulp-uglify');
var htmlclean = require('gulp-htmlclean');
var realFavicon = require ('gulp-real-favicon');
var fs = require('fs');
//developement server
var browserSync = require('browser-sync').create();

//don't need these?
//var pkg = require('./package.json');
//var cleanCSS = require('gulp-clean-css');
//var rename = require("gulp-rename");

// configuration variables
var paths = {
  srcHTML: 'src/**/*.html',
  srcSCSS: 'src/scss/**/*.scss',
  srcJS: 'src/js/**/*.js',
  srcIMG: 'src/img/**/*',
  dev: 'dev',
  devIndex: 'dev/index.html', // use with inject:dev later
  devHTML: 'dev/**/*.html',
  devCSS: 'dev/**/*.css', // use with inject:dev later
  devJS: 'dev/**/*.js', // use with inject:dev later
  dist: 'dist',
  distIndex: 'dist/index.html', // use with inject:dist later
  distHTML: 'dist/**/*.html',
  distCSS: 'dist/**/*.css', // use with inject:dist later
  distJS: 'dist/**/*.js', // use with inject:dist later

  srcFavIconMaster: 'assets/FustusBunyun_icon.png',
  srcFavIcons: 'src/favicons'
};
var files = {
  js: 'fustus.js' //replace this kludge with inject
};

var postcssProcessors = [
  autoprefixer({browsers: ['> 1%']})
  //add plugin to remove unused/unreferenced css styles?
];

// build dev folder
//cp HTML
gulp.task('cphtml',false, function () {
  return gulp.src(paths.srcHTML)
	.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
  .pipe(gulp.dest(paths.dev));
});
//cp IMG
gulp.task('cpimg',false, function () {
  return gulp.src(paths.srcIMG).pipe(gulp.dest(paths.dev));
});
//cp JS
gulp.task('cpjs',false, function () {
  return gulp
    .src(paths.srcJS)
    .pipe(concat(files.js))
    .pipe(gulp.dest(paths.dev));
});
// process SCSS
gulp.task('processSCSS',false, function() {
  return gulp
    .src(paths.srcSCSS)
    //.pipe(sourcemaps.init())
    .pipe(sass.sync({ errLogToConsole: true, outputStyle: 'expanded' }).on('error', sass.logError))
    //.pipe(sourcemaps.write(paths.dev))
    .pipe(postcss(postcssProcessors))
    .pipe(gulp.dest(paths.dev))
});
//cp FavIcons
gulp.task('cpfav',false, function () {
  var FavFiles = paths.srcFavIcons + '/*';
  return gulp.src(FavFiles).pipe(gulp.dest(paths.dev));
});

// build production folder
//cp HTML
gulp.task('cphtml:dist',false, function () {
  return gulp
    .src(paths.srcHTML)
		.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
    .pipe(htmlclean())
    .pipe(gulp.dest(paths.dist));
});
//cp IMG
gulp.task('cpimg:dist',false, function () {
  //optimize SVG here? other formats too?
  return gulp.src(paths.srcIMG).pipe(gulp.dest(paths.dist));
});
//minify, cp JS
gulp.task('cpjs:dist',false, function () {
  return gulp
    .src(paths.srcJS)
    .pipe(concat(files.js))
    .pipe(uglify())
    .pipe(gulp.dest(paths.dist));
});
// process SCSS
gulp.task('processSCSS:dist',false, function() {
  return gulp
    .src(paths.srcSCSS)
    .pipe(sass.sync({ errLogToConsole: true, outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(postcss(postcssProcessors))
    .pipe(gulp.dest(paths.dist))
});
//
//cp FavIcons
gulp.task('cpfav:dist',false, function () {
  var FavFiles = paths.srcFavIcons + '/*';
  return gulp.src(FavFiles).pipe(gulp.dest(paths.dist));
});


//Watch src files
gulp.task('watchSrc',false, function() {
  gulp.watch(paths.srcHTML, ['cphtml']);
  gulp.watch(paths.srcIMG, ['cpimg']);
  gulp.watch(paths.srcJS, ['cpjs']);
  gulp.watch(paths.srcSCSS, ['processSCSS']);
});

//functions
function browserSyncInit(baseDir, files) {
  browserSync.instance = browserSync.init(files, {
    startPath: '/',
    server: {
      baseDir: baseDir
    }
  });
}
function throwError(taskName, msg) {
  throw new PluginError({
      plugin: taskName,
      message: msg
    });
}

//Rsync
gulp.task('deploy','rsync dist to the internet', ['build:dist'], function() {

  // Dirs and Files to sync
  rsyncPaths = [paths.dist];

  // Default options for rsync
  rsyncConf = {
    progress: true,
    incremental: true,
    relative: true,
    emptyDirectories: true,
    recursive: true,
    clean: true,
    exclude: [],
    compress: true,
    root: paths.dist,
    hostname: 'www.purnell.io',
    port: '809',
    username: 'dave',
  };

  // Staging
  if (argv.staging) {
    rsyncConf.destination = '/var/www/dev.fustusbunyun.com/html'; // path where uploaded files go
  // Production
  } else if (argv.production) {
    rsyncConf.destination = '/var/www/fustusbunyun.com/html'; // path where uploaded files go
  // Missing/Invalid Target
  } else {
    throwError('deploy', colors.red('Missing or invalide target'));
  }

  // Use gulp-rsync to sync the files
  return gulp.src(rsyncPaths)
  .pipe(gulpif(
      argv.production,
      prompt.confirm({
        message: 'Heads Up! Are you SURE you want to push to PRODUCTION?',
        default: false
      })
  ))
  .pipe(rsync(rsyncConf));
  }, {
    options: {
      'staging': 'sync to dev site',
      'production': 'sync to live site'
    }
});
//
//RealFaviconGenerator
// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'faviconData.json';
// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
gulp.task('generate-favicon',false, function(done) {
	realFavicon.generateFavicon({
		masterPicture: paths.srcFavIconMaster,
		dest: paths.srcFavIcons,
		iconsPath: '/',
		design: {
			ios: {
				pictureAspect: 'noChange',
				assets: {
					ios6AndPriorIcons: false,
					ios7AndLaterIcons: false,
					precomposedIcons: false,
					declareOnlyDefaultIcon: true
				}
			},
			desktopBrowser: {},
			windows: {
				pictureAspect: 'noChange',
				backgroundColor: '#da532c',
				onConflict: 'override',
				assets: {
					windows80Ie10Tile: false,
					windows10Ie11EdgeTiles: {
						small: false,
						medium: true,
						big: false,
						rectangle: false
					}
				}
			},
			androidChrome: {
				pictureAspect: 'noChange',
				themeColor: '#ffffff',
				manifest: {
					display: 'standalone',
					orientation: 'notSet',
					onConflict: 'override',
					declared: true
				},
				assets: {
					legacyIcon: false,
					lowResolutionIcons: false
				}
			},
			safariPinnedTab: {
				pictureAspect: 'blackAndWhite',
				threshold: 50,
				themeColor: '#5bbad5'
			}
		},
		settings: {
			scalingAlgorithm: 'Mitchell',
			errorOnImageTooSmall: false,
			readmeFile: false,
			htmlCodeFile: false,
			usePathAsIs: false
		},
		markupFile: FAVICON_DATA_FILE
	}, function() {
		done();
	});
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
gulp.task('check-for-favicon-update', 'checks for updates on RealFaviconGenerator', function(done) {
	var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
	realFavicon.checkForUpdates(currentVersion, function(err) {
		if (err) {
			throw err;
		}
	});
});

// Master tasks

// starts a development server
gulp.task('serve','build src & start dev server', ['build', 'watchSrc'], function () {
  browserSyncInit([ paths.dev ], [ paths.dev ]);
});
// starts a production server
gulp.task('serve:dist','build src & start production server', ['build:dist'], function () {
  browserSyncInit(paths.dist);
});
// run all dev build tasks
gulp.task('build','build src to dev', ['cphtml', 'cpimg', 'processSCSS', 'cpjs', 'cpfav']);
// run all production build tasks
gulp.task('build:dist','build src to dist', ['cphtml:dist', 'cpimg:dist', 'processSCSS:dist', 'cpjs:dist', 'cpfav:dist']);
//clean everything
gulp.task('clean','clean dev & dist', ['clean:dev', 'clean:dist']);
//empty dev folder
gulp.task('clean:dev','clean dev', function () {
  del(paths.dev);
});
//empty production folder
gulp.task('clean:dist','clean dist', function () {
  del(paths.dist);
});
// Default task
gulp.task('default', ['help']);
