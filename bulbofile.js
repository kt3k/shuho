const { asset, dest } = require('bulbo')

const { join, dirname, relative } = require('path')
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

const sort = (x, y) => moment(y.data.start).diff(x.data.start)
const getBasepath = path => join('.', relative(dirname(path), ''))
const DATE_FORMAT = 'YYYY-MM-DD'

dest(paths.dest)

asset('assets/**/*.*')

asset('2*/*.md')
  .pipe(
    data(file => {
      const m = moment(file.relative, 'YYYY/MM-DD.md')
      return {
        week: m.format('w'),
        start: m.startOf('isoWeek').format(DATE_FORMAT),
        end: m.endOf('isoWeek').format(DATE_FORMAT),
        basepath: getBasepath(file.relative)
      }
    })
  )
  .pipe(
    branch.obj(src => [
      src
        .pipe(
          acc(paths.index, {
            debounce: 500,
            sort
          })
        )
        .pipe(layout1.nunjucks('index.md.njk'))
        .pipe(data({ basepath: getBasepath(paths.index) })),
      src.pipe(layout1.nunjucks('shuho.md.njk'))
    ])
  )
  .pipe(md())
  .pipe(layout1.nunjucks('layout.njk'))
