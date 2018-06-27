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
  dest: 'build'
}

dest(paths.dest)

asset('assets/**/*.*')

asset('2*.md')
  .pipe(data(file => {
    const m = moment(file.relative, 'YYYY-MM-DD.md')
    return {
      week: m.format('w'),
      start: m.clone().startOf('isoWeek').format('YYYY-MM-DD'),
      end: m.clone().endOf('isoWeek').format('YYYY-MM-DD')
    }
  }))
  .pipe(branch.obj(src => [
    src.pipe(acc(paths.index, {
      debounce: 500,
      sort: (x, y) => moment(y.data.start).diff(x.data.start)
    })).pipe(layout1.nunjucks('index.md.njk')),
    src.pipe(layout1.nunjucks('shuho.md.njk'))
  ]))
  .pipe(md())
  .pipe(layout1.nunjucks('layout.njk'))
