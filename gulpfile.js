"use strict";

// Load plugins
const gulp = require("gulp");
//const watch         = require("gulp-watch");
//const gutil         = require("gulp-util");
//const del           = require("del");
const eslint = require("gulp-eslint");
const sass = require("gulp-sass");
const csscomb = require("gulp-csscomb");
const pug = require("gulp-pug");
const browsersync = require("browser-sync").create();
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const autoprefixer = require("gulp-autoprefixer");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const plumber = require("gulp-plumber");
const errorHandler = require("./util/handle-errors.js");
const notify = require("gulp-notify");

function browserSync(done) {
	browsersync.init({
		server: {
			baseDir: "build"
		},
		notify: false
		// port: 3000
		// tunnel: true,
		// tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
	});
	done();
}

// Task to BrowserSync Reload
/*function browserSyncReload(done) {
	browsersync.reload();
	done();
}*/

// Task to Optimize Images
function images() {
	return gulp.src("src/img/**/*")
		.pipe(newer("build/upload"))
		.pipe(imagemin([
			imagemin.gifsicle({
				interlaced: true
			}),
			imagemin.jpegtran({
				progressive: true
			}),
			imagemin.optipng({
				optimizationLevel: 5
			}),
			imagemin.svgo({
				plugins: [{
					removeViewBox: false,
					collapseGroups: true
				}]
			})
		]))
		.pipe(gulp.dest("build/img"));
}

// Task to Compile Sass
function css() {
	return gulp.src("./src/sass/style.sass")
		.pipe(sass({
			outputStyle: "expanded"
		}).on("error", notify.onError()))
		.pipe(autoprefixer(["last 15 versions"]))
		.pipe(csscomb())
		.pipe(gulp.dest("./build/src/css/"))
		.pipe(browsersync.stream());
}

// Task to Watch Sass Changes 
function watchSass() {
	gulp.watch("./src/sass/**/*.s+(ass|css)", gulp.parallel(css));
}

// Task to Lint scripts
function scriptsLint() {
	return gulp.src([
			"build/src/js/**/*",
			"!build/src/js/scripts.min.js",
			"./gulpfile.js"
		])
		.pipe(plumber({
			errorHandler: errorHandler
		}))
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
}

// Task to Transpile, concatenate and minify scripts
function scripts() {
	return (
		gulp.src([
			"src/js/jquery.min.js",
			"src/js/jquery.matchHeight.min.js",
			"src/js/jquery.maskedinput.min.js",
			"src/js/jquery.validate.min.js",
			"src/js/messages_ru.min.js",
			"src/js/jquery.fancybox.min.js"
		])
		.pipe(concat("scripts.min.js"))
		.pipe(uglify())
		.pipe(gulp.dest("build/src/js"))
		.pipe(browsersync.stream())
	);
}

// Task to Build HTML
function html() {
	return gulp.src("src/templates/pages/*.pug")
		.pipe(plumber({
			errorHandler: errorHandler
		}))
		.pipe(pug({
			pretty: true
		}))
		.pipe(gulp.dest("./build/"))
		.pipe(browsersync.stream());
}

// Task to Watch Templates Changes
function watchTemplates() {
	gulp.watch("./src/templates/**/*.pug", gulp.parallel(html));
}

// Define complex tasks
const js = gulp.series(
	scriptsLint,
	scripts
);
const build = gulp.parallel(
	css,
	watchSass,
	html,
	watchTemplates,
	js,
	browserSync
);

// Export tasks
exports.images = images;
exports.css = css;
exports.js = js;
exports.default = build;