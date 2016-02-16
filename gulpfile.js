var rename = require("gulp-rename");
var gulp = require('gulp');
var ftp = require('vinyl-ftp');
var fs = require("fs");

var ftpConfig = {
    exclude: [],
    rename: ['public', 'hub'],
    src: ['public/**/*.*'],
    dest: '',
    auth: {
        host: 'misitioba.com',
        user: '',
        password: '',
        parallel: 10,
        log: "gutil.log"
    }
};
var data = getJSON('./data.json');
ftpConfig.auth.user = data.login;
ftpConfig.auth.password = data.password;

console.log('Using ' + JSON.stringify({ user: ftpConfig.auth.user, pass: ftpConfig.auth.password }));

gulp.task('default', function() {
    console.log('success');
});

gulp.task('deploy', function() {
    var conn = ftp.create(ftpConfig.auth);

    return gulp.src(ftpConfig.src, {
            base: '.',
            buffer: false
        })
        .pipe(rename(function(path) {
            //path.dirname = path.dirname.toString().replace("dist", "");
            ftpConfig.exclude.forEach(function(v) {
                path.dirname = path.dirname.toString().replace(v, "");
                path.dirname = path.dirname.replace('//', '/');
            });
            if (ftpConfig.rename) {
                var v = ftpConfig.rename;
                path.dirname = path.dirname.replace(v[0], v[1]);
            }
            return path;
        }))
        .pipe(conn.newer('/' + ftpConfig.dest)) // only upload newer files
        .pipe(conn.dest('/' + ftpConfig.dest));

});

function readFileSync(file, encoding, json) {
    var filepath = __dirname + '/' + file;
    if (typeof(encoding) == 'undefined') {
        encoding = 'utf8';
    }
    var x = fs.readFileSync(filepath, encoding);
    return (json) ? JSON.parse(x) : x;
}

function getJSON(file) {
    return readFileSync(file, undefined, true);
}
