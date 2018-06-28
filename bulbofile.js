const { asset, dest } = require('bulbo')

const { join, dirname, relative } = require('path')
const md = require('gulp-remark')
const acc = require('vinyl-accumulate')
const rename = require('gulp-rename')
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
const SITE_TITLE = '@kt3k の週報'

dest(paths.dest)

asset('assets/**/*.*')
asset('assets/CNAME')

asset('2*/*.md')
  .pipe(rename({ extname: '.html' }))
  .pipe(
    data(file => {
      const m = moment(file.relative, 'YYYY/MM-DD.md')
      const year = m.format('YYYY')
      const week = m.format('w')
      const title = `${year}年第${week}週`
      return {
        year,
        week,
        start: m.startOf('isoWeek').format(DATE_FORMAT),
        end: m.endOf('isoWeek').format(DATE_FORMAT),
        basepath: getBasepath(file.relative),
        title
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
        .pipe(layout1.nunjucks('tmpl/index.md.njk'))
        .pipe(data({ basepath: getBasepath(paths.index) })),
      src.pipe(layout1.nunjucks('tmpl/shuho.md.njk'))
    ])
  )
  //*
  .pipe(
    md()
      .use(require('remark-slug'))
      .use(require('remark-align'))
      .use(require('remark-html'))
  )
  //*/
  .pipe(layout1.nunjucks('tmpl/layout.njk', { data: { SITE_TITLE } }))