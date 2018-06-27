const { asset, dest } = require('bulbo')

const { basename } = require('path')
const md = require('gulp-markdown')
const acc = require('vinyl-accumulate')
const layout1 = require('layout1')
const branch = require('branch-pipe')
const data = require('gulp-data')
const moment = require('moment')

const paths = {
  index: 'index.html',
  indexLayout: 'index.njk',
  layout: 'layout.njk',
  dest: 'build'
}

dest(paths.dest)

asset('assets/**/*.*')

asset('2*.md')
  .pipe(data(file => {
    const m = moment(file.relative, 'YYYY-MM-DD.md')
    return {
      week: m.format('w'),
      start: m.clone().startOf('isoWeek'),
      end: m.clone().endOf('isoWeek')
    }
  }))
  .pipe(md())
  .pipe(branch.obj(src => [
    src.pipe(acc(paths.index, {
      debounce: 500,
      sort: (x, y) => y.data.start.diff(x.data.start)
    })).pipe(layout1.nunjucks(paths.indexLayout)),
    src.pipe(layout1.nunjucks(paths.layout))
  ]))
