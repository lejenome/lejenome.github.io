"use strict";

const gulp = require("gulp");
const rename = require("gulp-rename");
const eslint = require("gulp-eslint");
const gulpStylelint = require("gulp-stylelint");
const prettify = require("gulp-jsbeautifier");

const BASE_DIR = "./";

const JSFiles = [
  "./**/*.js",
  "!**/*.min.js",
  "!**/vendor/**/*",
  "!_site/**/*",
  "!jukax-about/**/*",
  "!meet-ubuntu-ads/**/*",
  "!meet-ubuntu-ads_next/**/*",
  "!tests/**/*",
  "!jukax/**/*",
  "!node_modules/**/*",
  // "gulpfile.js",
];

const CSSFiles = [
  "./**/*.css",
  "./**/*.scss",
  "./**/*.sass",
  "./**/*.less",
  "!_assets/css/*.scss",
  "!**/*.min.css",
  "!**/vendor/**/*",
  "!_site/**/*",
  "!jukax-about/**/*",
  "!meet-ubuntu-ads/**/*",
  "!meet-ubuntu-ads_next/**/*",
  "!tests/**/*",
  "!jukax/**/*",
  "!node_modules/**/*",
];

const HTMLFiles = [
  ".**/*.html",
  "!**/vendor/**/*",
  "!_site/**/*",
  "!jukax-about/**/*",
  "!meet-ubuntu-ads/**/*",
  "!meet-ubuntu-ads_next/**/*",
  "!tests/**/*",
  "!jukax/**/*",
  "!node_modules/**/*",
];

const jsLint = () =>
  gulp
    .src(JSFiles)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());

const jsPrettify = () =>
  gulp
    .src(JSFiles.concat([".jsbeautifyrc", ".stylelintrc"]))
    .pipe(
      prettify({
        js: {
          file_types: [".js", ".json", ".jsbeautifyrc", ".stylelintrc"],
          config: "./.jsbeautifyrc",
        },
      })
    )
    .pipe(gulp.dest((_) => _.base));

const cssLint = () =>
  gulp.src(CSSFiles).pipe(
    gulpStylelint({
      reporters: [
        {
          formatter: "string",
          console: true,
        },
      ],
    })
  );

const cssPrettify = () =>
  gulp
    .src(CSSFiles)
    .pipe(
      prettify({
        css: {
          file_types: [".css", ".less", ".sass", ".scss"],
          config: "./.jsbeautifyrc",
        },
      })
    )
    .pipe(gulp.dest((_) => _.base));

const htmlPrettify = () =>
  gulp
    .src(HTMLFiles)
    .pipe(
      prettify({
        html: {
          file_types: [".html"],
          config: "./.jsbeautifyrc",
        },
      })
    )
    .pipe(gulp.dest((_) => _.base));

// Copy vendor files from /node_modules into /vendor
// NOTE: requires `npm install` before running!
const copy = gulp.parallel(
  () =>
    gulp
      .src(["node_modules/font-awesome/css/*", "!**/*.map"])
      .pipe(gulp.dest(BASE_DIR + "_assets/vendor/font-awesome/css")),
  () =>
    gulp
      .src(["node_modules/font-awesome/fonts/*"])
      .pipe(gulp.dest(BASE_DIR + "_assets/vendor/font-awesome/fonts")),
  () =>
    gulp
      .src([
        "node_modules/bootstrap/dist/**/bootstrap.*",
        "node_modules/bootstrap/dist/**/bootstrap-*.*",
        "!**/bootstrap-theme.*",
        "!**/bootstrap.bundle.*",
        "!**/*.map",
        "!**/fonts/*",
      ])
      .pipe(gulp.dest(BASE_DIR + "_assets/vendor/bootstrap")),
  () =>
    gulp
      .src(["node_modules/normalize.css/normalize.css"])
      .pipe(rename("normalize.scss"))
      .pipe(gulp.dest(BASE_DIR + "_sass/vendor"))
);

const html = gulp.series(htmlPrettify);
const css = gulp.series(cssPrettify, cssLint);
const js = gulp.series(() => Promise.resolve(true) /*jsPrettify, jsLint*/);

// Default task
const defaultTask = gulp.series(html, js, css, copy);

exports.html = html;
exports.css = css;
exports.js = js;
exports.default = defaultTask;
