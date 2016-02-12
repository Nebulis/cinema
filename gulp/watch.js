'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');


function isOnlyChange(event) {
  return event.type === 'changed';
}

gulp.task('watch', ['markups', 'inject'], function () {

  gulp.watch([path.join(conf.paths.src, '/*.html'), 'bower.json'], ['inject']);

  gulp.watch([
    path.join(conf.paths.src, '/app/**/*.css'),
    path.join(conf.paths.src, '/app/**/*.styl')
  ], function(event) {
    if(isOnlyChange(event)) {
      gulp.start('styles');
    } else {
      gulp.start('inject');
    }
  });

  gulp.watch(path.join(conf.paths.src, '/app/**/*.js'), function(event) {
    if(isOnlyChange(event)) {
      gulp.start('scripts');
    } else {
      gulp.start('inject');
    }
  });

  gulp.watch(path.join(conf.paths.src, '/app/**/*.jade'), ['markups']);
});
