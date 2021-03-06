gulp-inline-sourcemap
===========

[![NPM](https://nodei.co/npm/gulp-inline-sourcemap.png)](https://npmjs.org/package/gulp-inline-sourcemap)
<span class="badge-npmdownloads"><a href="https://npmjs.org/package/gulp-inline-sourcemap" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/gulp-inline-sourcemap.svg" alt="NPM downloads" /></a></span>

Gulp task for appending external SourceMap to the end of js-bundle (those within a //# sourceMappingURL=... declaration) into base64-encoded data URI strings.

## Install

Install with [npm](https://npmjs.org)

```
npm install gulp-inline-sourcemap --save-dev
```

## Example usage
```js
var gulp = require('gulp');
var inlineSourceMap = require('gulp-inline-sourcemap');

//basic example
gulp.task('build', function () {
    return gulp.src('./*.js')
        .pipe(inlineSourceMap())
        .pipe(gulp.dest('./public/js'));
});
...
//example with options
gulp.task('build', function () {
    return gulp.src('./*.js')
        .pipe(inlineSourceMap({
            baseDir: 'public',
            debug: true
        }))
        .pipe(gulp.dest('./public/js'));
});

```
## Options

  - `baseDir`  (String)  
    If you have absolute paths, the path specified
    in this option will be used as the base directory (relative to gulpfile).

  - `debug` (Boolean)  
    Enable log to console.
