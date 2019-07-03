/**
 * Gulpfile.
 *
 * A basic implementation of Gulp for HTML development.
 *
 * @since 1.0.0
 * @author Tim Breeze (@tim_breeze)
 */

 // Project related.
var project              = 'altior-construction'; // Project Name.
var projectURL           = 'localhost/altior'; // Project URL. Could be something like localhost:8888.
var productURL           = './'; // Theme/Plugin URL. Leave it like it is, since our gulpfile.js lives in the root folder.

// Style related.
var styleSRC             = './src/scss/main.scss'; // Path to main .scss file.
var styleDestination     = './app/css/'; // Path to place the compiled CSS file.
// Defualt set to root folder.

// JS Vendor related.
var jsVendorSRC          = './src/js/vendor/*.js'; // Path to JS vendor folder.
var jsVendorDestination  = './app/js/'; // Path to place the compiled JS vendors file.
var jsVendorFile         = 'vendors'; // Compiled JS vendors file name.
// Default set to vendors i.e. vendors.js.

// JS Custom related.
var jsCustomSRC          = './src/js/custom/*.js'; // Path to JS custom scripts folder.
var jsCustomDestination  = './app/js/'; // Path to place the compiled JS custom scripts file.
var jsCustomFile         = 'custom'; // Compiled JS custom file name.
// Default set to custom i.e. custom.js.

// Images related.
var imagesSRC            = './src/img/**/*.{png,jpg,gif,svg}'; // Source folder of images which should be optimized.
var imagesDestination    = './app/img/'; // Destination folder of optimized images. Must be different from the imagesSRC folder.

// Watch files paths.
var styleWatchFiles      = './src/scss/**/*.scss'; // Path to all *.scss files inside css folder and inside them.
var vendorJSWatchFiles   = './src/js/vendor/*.js'; // Path to all vendor JS files.
var customJSWatchFiles   = './src/js/custom/*.js'; // Path to all custom JS files.
var projectHTMLWatchFiles = './app/**/*.html'; // Path to all PHP files.

// Browsers you care about for autoprefixing.
// Browserlist https://github.com/ai/browserslist
const AUTOPREFIXER_BROWSERS = [
    'last 2 version',
    '> 1%',
    'ie >= 9',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4',
    'bb >= 10'
  ];


/**
 * Load Plugins.
 *
 * Load gulp plugins and assing them semantic names.
 */

var gulp              = require('gulp'); // Gulp
var gutil             = require('gulp-util'); // Gulp Utilities

// CSS related plugins.
var sass              = require('gulp-sass'); // Gulp pluign for Sass compilation
var cssnano           = require('gulp-cssnano'); // Minifies CSS files
var autoprefixer      = require('gulp-autoprefixer'); // Autoprefixing magic
var mmq               = require('gulp-merge-media-queries'); // Combines media queries into one media query definition

// JS related plugins.
var concat            = require('gulp-concat'); // Concatenates JS files
var uglify            = require('gulp-uglify'); // Minifies JS files
var jshint            = require('gulp-jshint');

// Image realted plugins.
var imagemin          = require('gulp-imagemin'); // Minify PNG, JPEG, GIF and SVG images with imagemin.

// Utility related plugins.
var rename            = require('gulp-rename'); // Renames files E.g. style.css -> style.min.css
var lineec            = require('gulp-line-ending-corrector'); // Consistent Line Endings for non UNIX systems. Gulp Plugin for Line Ending Corrector (A utility that makes sure your files have consistent line endings)
var filter            = require('gulp-filter'); // Enables you to work on a subset of the original files by filtering them using globbing.
var sourcemaps        = require('gulp-sourcemaps'); // Maps code in a compressed file (E.g. style.css) back to it’s original position in a source file (E.g. structure.scss, which was later combined with other css files to generate style.css)
var notify            = require('gulp-notify'); // Sends message notification to you
var browserSync       = require('browser-sync'); // Reloads browser and injects CSS. Time-saving synchronised browser testing.
var reload       = browserSync.reload; // For manual browser reload.

var package           = require('./package.json');

/**
 * Task: `styles`.
 *
 * Compiles Sass, Autoprefixes it and Minifies CSS.
 *
 * This task does the following:
 * 		1. Gets the source scss file
 * 		2. Compiles Sass to CSS
 * 		3. Writes Sourcemaps for it
 * 		4. Autoprefixes it and generates style.css
 * 		5. Renames the CSS file with suffix .min.css
 * 		6. Minifies the CSS file and generates style.min.css
 * 		7. Injects CSS or reloads the browser via browserSync
 */
gulp.task('styles', function () {
    gulp.src( styleSRC )
       .pipe( sourcemaps.init() )
       .pipe( sass( {
           errLogToConsole: true,
           outputStyle: 'compact',
           //outputStyle: 'compressed',
           // outputStyle: 'nested',
           // outputStyle: 'expanded',
           precision: 10
       } ) )
       .on('error', console.error.bind(console))
       .pipe( sourcemaps.write( { includeContent: false } ) )
       .pipe( sourcemaps.init( { loadMaps: true } ) )
       .pipe( autoprefixer( AUTOPREFIXER_BROWSERS ) )

       .pipe( sourcemaps.write ( '/' ) )
       .pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
       .pipe( gulp.dest( styleDestination ) )

       .pipe( filter( '**/*.css' ) ) // Filtering stream to only css files
       .pipe( mmq( { log: true } ) ) // Merge Media Queries only for .min.css version.

       .pipe( browserSync.stream() ) // Reloads style.css if that is enqueued.

       .pipe( rename( { suffix: '.min' } ) )
       .pipe(cssnano())
       .pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
       .pipe( gulp.dest( styleDestination ) )

       .pipe( filter( '**/*.css' ) ) // Filtering stream to only css files
       .pipe( browserSync.reload( { stream:true } ) )// Reloads style.min.css if that is enqueued.
       .pipe( notify( { message: 'TASK: "styles" Completed! 💯', onLast: true } ) )
});

// gulp.task('css', function () {
//     return gulp.src('src/scss/style.scss')
//     .pipe(sourcemaps.init())
//     .pipe(sass().on('error', sass.logError))
//     .pipe(autoprefixer('last 4 version'))
//     .pipe(gulp.dest('app/assets/css'))
//     .pipe(cssnano())
//     .pipe(rename({ suffix: '.min' }))
//     .pipe(sourcemaps.write())
//     .pipe(gulp.dest('app/assets/css'))
//     .pipe(browserSync.reload({stream:true}));
// });



 /**
  * Task: `vendorJS`.
  *
  * Concatenate and uglify vendor JS scripts.
  *
  * This task does the following:
  * 		1. Gets the source folder for JS vendor files
  * 		2. Concatenates all the files and generates vendors.js
  * 		3. Renames the JS file with suffix .min.js
  * 		4. Uglifes/Minifies the JS file and generates vendors.min.js
  */
  gulp.task( 'vendorsJs', function() {
    gulp.src( jsVendorSRC )
        .pipe(sourcemaps.init())
        .pipe(jshint('.jshintrc'))
        .pipe( concat( jsVendorFile + '.js' ) )
        .pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
        .pipe( gulp.dest( jsVendorDestination ) )
        .pipe( rename( {
            basename: jsVendorFile,
            suffix: '.min'
        }))
        .pipe( uglify() )
        .pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
        .pipe(sourcemaps.write())
        .pipe( gulp.dest( jsVendorDestination ) )
        .pipe( notify( { message: 'TASK: "vendorsJs" Completed! 💯', onLast: true } ) );
});


 /**
  * Task: `customJS`.
  *
  * Concatenate and uglify custom JS scripts.
  *
  * This task does the following:
  * 		1. Gets the source folder for JS custom files
  * 		2. Concatenates all the files and generates custom.js
  * 		3. Renames the JS file with suffix .min.js
  * 		4. Uglifes/Minifies the JS file and generates custom.min.js
  */
  gulp.task( 'customJS', function() {
    gulp.src( jsCustomSRC )
       .pipe(sourcemaps.init())
       .pipe(jshint('.jshintrc'))
       .pipe( concat( jsCustomFile + '.js' ) )
       .pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
       .pipe( gulp.dest( jsCustomDestination ) )
       .pipe( rename( {
           basename: jsCustomFile,
           suffix: '.min'
       }))
       .pipe( uglify() )
       .pipe( lineec() ) // Consistent Line Endings for non UNIX systems.
       .pipe(sourcemaps.write())
       .pipe( gulp.dest( jsCustomDestination ) )
       .pipe( notify( { message: 'TASK: "customJs" Completed! 💯', onLast: true } ) );
});

// gulp.task('js',function(){
//   gulp.src('src/js/scripts.js')
//     .pipe(sourcemaps.init())
//     .pipe(jshint('.jshintrc'))
//     .pipe(jshint.reporter('default'))
//     .pipe(gulp.dest('app/assets/js'))
//     .pipe(uglify())
//     .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
//     .pipe(rename({ suffix: '.min' }))
//     .pipe(sourcemaps.write())
//     .pipe(gulp.dest('app/assets/js'))
//     .pipe(browserSync.reload({stream:true, once: true}));
// });


 /**
  * Task: `images`.
  *
  * Minifies PNG, JPEG, GIF and SVG images.
  *
  * This task does the following:
  * 		1. Gets the source of images raw folder
  * 		2. Minifies PNG, JPEG, GIF and SVG images
  * 		3. Generates and saves the optimized images
  *
  * This task will run only once, if you want to run it
  * again, do it with the command `gulp images`.
  */
  gulp.task( 'images', function() {
    gulp.src( imagesSRC )
        .pipe( imagemin( {
                    progressive: true,
                    optimizationLevel: 3, // 0-7 low-high
                    interlaced: true,
                    svgoPlugins: [{removeViewBox: false}]
                } ) )
        .pipe(gulp.dest( imagesDestination ))
        .pipe( notify( { message: 'TASK: "images" Completed! 💯', onLast: true } ) );
});



gulp.task('browser-sync', function() {
    browserSync.init(null, {
        server: {
            baseDir: "app"
        }
    });
});
// gulp.task('bs-reload', function () {
//     browserSync.reload();
// });

// gulp.task( 'default', ['styles', 'vendorsJs', 'customJS', 'images', 'browser-sync'], function () {
//     gulp.watch("src/scss/**/*.scss", ['css']);
//     gulp.watch("src/js/*.js", ['js']);
//     gulp.watch("app/*.html", ['bs-reload']);
// });

gulp.task( 'default', ['styles', 'vendorsJs', 'customJS', 'images', 'browser-sync'], function () {
    gulp.watch( projectHTMLWatchFiles, reload ); // Reload on PHP file changes.
    gulp.watch( styleWatchFiles, [ 'styles' ] ); // Reload on SCSS file changes.
    gulp.watch( vendorJSWatchFiles, [ 'vendorsJs', reload ] ); // Reload on vendorsJs file changes.
    gulp.watch( customJSWatchFiles, [ 'customJS', reload ] ); // Reload on customJS file changes.
});