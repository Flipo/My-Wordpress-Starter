/*******************************************************************************
1. DEPENDENCIES
*******************************************************************************/

var gulp            = require('gulp');                             // gulp core
    sass            = require('gulp-sass'),                        // sass compiler
    uglify          = require('gulp-uglify'),                    // uglifies the js
    jshint          = require('gulp-jshint'),                    // check if js is ok
    rename          = require("gulp-rename");                    // rename files
    concat          = require('gulp-concat'),                    // concatinate js
    notify          = require('gulp-notify'),                    // send notifications to osx
    plumber         = require('gulp-plumber'),                  // disable interuption
    stylish         = require('jshint-stylish'),                // make errors look good in shell
    minifycss       = require('gulp-minify-css'),             // minify the css files
    browserSync     = require('browser-sync'),              // inject code to all devices
    svgstore        = require('gulp-svgstore'),
    svgmin          = require('gulp-svgmin'),
    inject          = require('gulp-inject'),
    cheerio         = require('gulp-cheerio'),
    include         = require('gulp-include'),
    addsrc          = require('gulp-add-src'),
    imagemin        = require('gulp-imagemin'),
    pngquant        = require('imagemin-pngquant'),
    autoprefixer    = require('gulp-autoprefixer');        // sets missing browserprefixes


/*******************************************************************************
2. FILE DESTINATIONS (RELATIVE TO ASSSETS FOLDER)
*******************************************************************************/

var target = {
    img_src : 'img/*',
    svg_src : 'img/symbols/*.svg',
    sass_src : 'scss/**/*.scss',                        // all sass files
    css_dest : 'css',                                   // where to put minified css
    js_dest : 'js'                                      // where to put minified js
};


/*******************************************************************************
3. SASS TASK
*******************************************************************************/

gulp.task('sass', function() {
    gulp.src(target.sass_src)                           // get the files
        .pipe(plumber())                                // make sure gulp keeps running on errors
        .pipe(sass())                                   // compile all sass
        .pipe(autoprefixer(                             // complete css with correct vendor prefixes
            'last 2 version',
            '> 1%',
            'ie 8',
            'ie 9',
            'ios 6',
            'android 4'
        ))
        .pipe(minifycss())                              // minify css
        .pipe(gulp.dest(target.css_dest))               // where to put the file
        .pipe(notify({message: 'SCSS processed!'}));    // notify when done
});


/*******************************************************************************
4. JS TASKS
*******************************************************************************/

gulp.task('js', function() {
    gulp.src('./js/scripts.js')
        .pipe(plumber())
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./js/min'))
        .pipe(notify("Javascript minified"));
    gulp.src('./js/plugins.js')
        .pipe(plumber())
        .pipe(include())
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./js/min'))
        .pipe(notify("Javascript concatenated"));
});


/*******************************************************************************
5. BROWSER SYNC
*******************************************************************************/

gulp.task('browser-sync', function() {
    browserSync({
        files: ["./css/*.css", "./*.php", "./js/**/*.js"],
        proxy: "patrice-kunte.dev"
    });
});


/*******************************************************************************
6. SVG STORE
*******************************************************************************/

gulp.task('svgstore', function () {
    var svgs = gulp
        .src(target.svg_src)
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(svgstore({ inlineSvg: true }));

    function fileContents (filePath, file) {
        return file.contents.toString();
    }

    return gulp
        .src('./includes/svg.php')
        .pipe(inject(svgs, { transform: fileContents }))
        .pipe(gulp.dest('./includes'))
        .pipe(notify("SVG inserted"));
});

/*******************************************************************************
7. IMAGES
*******************************************************************************/

gulp.task('images', function () {
    return gulp.src(target.img_src)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(notify("Images optimized"));
});

/*******************************************************************************
1. GULP TASKS
*******************************************************************************/

gulp.task('default', ['sass', 'js', 'browser-sync', 'svgstore', 'images'], function() {
    gulp.watch(target.sass_src, function() {
        gulp.run('sass');
    });
    gulp.watch('./js/*.js', function() {
        gulp.run('js');
    });
    gulp.watch(target.svg_src, function() {
        gulp.run('svgstore');
    });
    gulp.watch(target.img_src, function() {
        gulp.run('images');
    });
});