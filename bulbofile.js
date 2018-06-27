const { asset, dest } = require('bulbo')

const fm = require('gulp-front-matter')
const md = require('gulp-markdown')
const acc = require('vinyl-accumulate')
const layout1 = require('layout1')
const branch = require('branch-pipe')

const paths = {
  index: 'index.html',
  indexLayout: 'index.njk',
  layout: 'layout.njk',
  dest: 'build'
}

dest(paths.dest)

asset('assets/**/*.*')

asset('2*.md')
  .pipe(fm({ property: 'fm' }))
  .pipe(md())
  .pipe(branch.obj(src => [
    src.pipe(acc(paths.index, { debounce: 500 })).pipe(layout1.nunjucks(paths.indexLayout)),
    src.pipe(layout1.nunjucks(paths.layout))
  ]))
