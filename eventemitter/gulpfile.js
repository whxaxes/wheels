var gulp = require("gulp");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");

gulp.task('default' , function(){
    gulp.src('./eventemitter.js')
        .pipe(uglify())
        .pipe(rename('eventemitter.min.js'))
        .pipe(gulp.dest("./"));
})
