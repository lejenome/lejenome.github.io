"use strict";

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const gulpStylelint = require('gulp-stylelint');
const prettify = require('gulp-jsbeautifier');

const BASE_DIR = './';

const JSFiles = [
  './**/*.js',
  '!**/*.min.js',
  '!vendor/**/*',
  '!_site/**/*',
  '!jukax-about/**/*',
  '!meet-ubuntu-ads/**/*',
  '!meet-ubuntu-ads_next/**/*',
  '!tests/**/*',
  '!jukax/**/*',
  '!node_modules/**/*',
  'gulpfile.js',
];

const CSSFiles = [
  './**/*.css',
  './**/*.scss',
  './**/*.sass',
  './**/*.less',
  '!css/style.scss',
  '!**/*.min.css',
  '!vendor/**/*',
  '!_site/**/*',
  '!jukax-about/**/*',
  '!meet-ubuntu-ads/**/*',
  '!meet-ubuntu-ads_next/**/*',
  '!tests/**/*',
  '!jukax/**/*',
  '!node_modules/**/*',
];

const HTMLFiles = [
  '.**/*.html',
  '!vendor/**/*',
  '!_site/**/*',
  '!jukax-about/**/*',
  '!meet-ubuntu-ads/**/*',
  '!meet-ubuntu-ads_next/**/*',
  '!tests/**/*',
  '!jukax/**/*',
  '!node_modules/**/*',
];

gulp.task('js:lint', () =>
  gulp.src(JSFiles)
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError()));

gulp.task('js:prettify', () =>
  gulp.src(JSFiles.concat(['.jsbeautifyrc', '.stylelintrc']))
  .pipe(prettify({
    js: {
      file_types: ['.js', '.json', '.jsbeautifyrc', '.stylelintrc'],
      config: './.jsbeautifyrc',
    },
  })).pipe(gulp.dest((_) => _.base)));

gulp.task('css:lint', () =>
  gulp.src(CSSFiles)
  .pipe(gulpStylelint({
    reporters: [{
      formatter: 'string',
      console: true,
    }],
  })));

gulp.task('css:prettify', () =>
  gulp.src(CSSFiles)
  .pipe(prettify({
    css: {
      file_types: ['.css', '.less', '.sass', '.scss'],
      config: './.jsbeautifyrc',
    },
  })).pipe(gulp.dest((_) => _.base)));

gulp.task('html:prettify', () =>
  gulp.src(HTMLFiles)
  .pipe(prettify({
    html: {
      file_types: ['.html'],
      config: './.jsbeautifyrc',
    },
  })).pipe(gulp.dest((_) => _.base)));

// Copy vendor files from /node_modules into /vendor
// NOTE: requires `npm install` before running!
gulp.task('copy', function() {
  gulp.src([
      'node_modules/font-awesome/css/*',
      '!**/*.map',
    ])
    .pipe(gulp.dest(BASE_DIR + 'vendor/font-awesome/css'));
  gulp.src([
      'node_modules/font-awesome/fonts/*',
    ])
    .pipe(gulp.dest(BASE_DIR + 'vendor/font-awesome/fonts'));
  gulp.src([
      'node_modules/bootstrap/dist/**/bootstrap.*',
      'node_modules/bootstrap/dist/**/bootstrap.*',
      '!**/bootstrap-theme.*',
      '!**/bootstrap.bundle.*',
      '!**/*.map',
      '!**/fonts/*',
    ])
    .pipe(gulp.dest(BASE_DIR + 'vendor/bootstrap'));
  gulp.src([
      'node_modules/normalize.css/normalize.css',
    ])
    .pipe(gulp.dest(BASE_DIR + 'vendor/'));
});

gulp.task('html', ['html:prettify']);
gulp.task('css', ['css:prettify', 'css:lint']);
gulp.task('js', ['js:prettify', 'js:lint']);

// Default task
gulp.task('default', [
  'html',
  'js',
  'css',
  'copy',
]);