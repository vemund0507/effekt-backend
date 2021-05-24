const gulp = require('gulp');
const sass = require('gulp-sass');
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

const stylesPath = './views/style/**/*.scss'

function build() {
    return gulp.series([typescript, styles])
}

function styles() {
    return gulp.src(stylesPath)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./views/style/'));
}

function watch() {
    //gulp.series('styles')
    return gulp.watch(stylesPath, gulp.series(styles))
}

function typescript() {
    return tsProject.src().pipe(tsProject()).js.pipe(gulp.dest("dist"))
}

exports.default = build
exports.watch = watch
exports.typescript = typescript