let project_folder = "dist";
let source_folder = "src";
let fonts_style = require('fs');

//Пути к файлам
let path = {
   build: {
      html: project_folder + "/",
      css: project_folder + "/css/",
      js: project_folder + "/js/",
      img: project_folder + "/img/",
      fonts: project_folder + "/fonts/",
      other_files: project_folder + "/"
   }, 
   src: {
      html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
      css: source_folder + "/css/normalize.css",
      scss: source_folder + "/scss/main.scss",
      js: source_folder + "/js/_*.js",
      img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
      fonts: source_folder + "/fonts/*.ttf",
      other_files: "{.gitattributes,.gitignore,.htaccess,404.html,browserconfig.xml,favicon.ico,icon.png,robots.txt,site.webmanifest,tile.png,tile-wide.png}"
   }, 
   watch: {
      html: source_folder + "/**/*.html",
      css: source_folder + "/scss/**/*.scss",
      js: source_folder + "/js/**/*.js",
      img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}"
   }, 
   clean: "./" + project_folder + "/"
};

let {src, dest} = require("gulp"), 
   gulp = require("gulp"),
   browser_sync = require("browser-sync").create(),
   file_include = require("gulp-file-include"),
   concat = require("gulp-concat"),
   del = require("del"),
   scss = require("gulp-sass"),
   auto_prefixer = require("gulp-autoprefixer"),
   group_media = require("gulp-group-css-media-queries"),
   clean_css = require("gulp-clean-css"),
   rename = require("gulp-rename"),
   uglify = require("gulp-uglify-es").default,
   imagemin = require("gulp-imagemin"),
   webp = require("gulp-webp"),
   svg_sprite = require("gulp-svg-sprite"), 
   ttf2woff = require("gulp-ttf2woff"),
   ttf2woff2 = require("gulp-ttf2woff2"),
   fonter = require("gulp-fonter");

//поддержка старых бразерров при написании JS по новым стандартам 
//   babel = require('gulp-babel');

//Заупск веб-сервера   
function browserSync(params){
   browser_sync.init({
      server: {
         baseDir: "./" + project_folder + "/"
      },
      port: 3000,
      notify: false //Отключены уведомления
   });
}

//Сборка index.html
function html(){
   return src(path.src.html)
      .pipe(file_include())
      .pipe(dest(path.build.html))
      .pipe(browser_sync.stream());
}

//Сборка .css с препроцессором
function css(){
   return src(path.src.scss)
         .pipe(scss({
            outputStyle: "expanded"
         }))
         .pipe(group_media())
         .pipe(auto_prefixer({
            overrideBrowserslist: ["last 5 versions"],
            cascad: true,
            grid: true
         }))
         .pipe(dest(path.build.css))
         .pipe(clean_css())
         .pipe(rename({
            extname: ".min.css"
         }))
         .pipe(dest(path.build.css))
         .pipe(browser_sync.stream()),
      src(path.src.css)
         .pipe(clean_css())
         .pipe(rename({
            extname: ".min.css"
         }))   
         .pipe(dest(path.build.css));
}

//Сборка .js файлов
function js(){
   return src(path.src.js)
            .pipe(concat('main.js'))
            // .pipe(babel({      // при написании JS по новым стандартам
            //    presets: ['@babel/env']
            // }))
            .pipe(dest(path.build.js))
            .pipe(uglify())
            .pipe(rename({
               extname: ".min.js"
            }))
            .pipe(dest(path.build.js))
            .pipe(browser_sync.stream()),
         src(source_folder + "/js/plugins.js")
            .pipe(dest(path.build.js))
            .pipe(uglify())
            .pipe(rename({
               extname: ".min.js"
            }))
            .pipe(dest(path.build.js))
            .pipe(browser_sync.stream()),
         src(source_folder + "/js/vendor/*.js")
            .pipe(dest(project_folder + "/js/vendor/"));
}

//Перенос корневых файлов 
function otherFiles(params) {
   return src(path.src.other_files)
      .pipe(dest(path.build.other_files))
      .pipe(browser_sync.stream());
}

//Обратботка картинок
function images(){
   return src(path.src.img)
      .pipe(webp({
         quality: 75
      }))
      .pipe(dest(path.build.img))
      .pipe(src(path.src.img))
      .pipe(imagemin([
         imagemin.gifsicle({interlaced: true}),
         imagemin.mozjpeg({quality: 75, progressive: true}),
         imagemin.optipng({optimizationLevel: 4}), //от 0 до 7
         imagemin.svgo({
            plugins: [
               {removeViewBox: false},
               {cleanupIDs: false}
            ]
         })
      ]))
      .pipe(dest(path.build.img))
      .pipe(browser_sync.stream());
}

//Обрабтка шрифтов 
function fonts() {
   src(path.src.fonts)
      .pipe(ttf2woff())
      .pipe(dest(path.build.fonts));
   return src(path.src.fonts)
      .pipe(ttf2woff2())
      .pipe(dest(path.build.fonts));
}

//Конвертация .otf в .ttf
gulp.task('otf2ttf', function() {
   return gulp.src(source_folder + '/fonts/*.otf')
      .pipe(fonter({
         formats: ['ttf']
      }))
      .pipe(dest(source_folder + '/fonts/'))
})

//Формирование .svg спрайта
gulp.task('svg_sprite', function() {
   return gulp.src(source_folder + '/iconsprite/*.svg')
      .pipe(svg_sprite({
         mode: {
            stack: {
               sprite: "../icons/icons.svg",
               example: true
            } 
         },
      }))
      .pipe(dest(path.build.img))
})

// Формирование fonts.scss из имеющихся шрифтов
function fontsStyle(params) {
   let file_content = fonts_style.readFileSync(source_folder + '/scss/fonts.scss');
   if (file_content == '') {
      fonts_style.writeFile(source_folder + '/scss/fonts.scss', '', cb);
      return fonts_style.readdir(path.build.fonts, function (err, items) {
         if (items) {
            let c_fontname;
            for (var i = 0; i < items.length; i++) {
               let fontname = items[i].split('.');
               fontname = fontname[0];
               if (c_fontname != fontname) { 
                  fonts_style.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
               }
               c_fontname = fontname;
            }
         }
      })
   }
}
// Callback   
function cb() { 

}

//Слежка за файлами и перезагрузка их в реальном времени
function watchFiles(params){
   gulp.watch([path.watch.html], html);
   gulp.watch([path.watch.css], css);
   gulp.watch([path.watch.js], js);
   gulp.watch([path.watch.img], images);
}

//Очистка папки dist
function clean(params){
   return del(path.clean);
}

//Сценарий выполнения функций
let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts, otherFiles), fontsStyle);
let watch = gulp.parallel(build, watchFiles, browserSync);

//Передача переменных в gulp
exports.otherFiles = otherFiles;
exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;