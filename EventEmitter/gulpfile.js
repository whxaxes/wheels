var gulp = require("gulp");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");

gulp.task('default' , function(){
    gulp.src('./validate.js')
        .pipe(uglify())
        .pipe(rename('validate.min.js'))
        .pipe(gulp.dest("./"));
})
