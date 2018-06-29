const { asset, dest } = require('bulbo')

const { join, dirname, relative } = require('path')
const accumulate = require('vinyl-accumulate')
const rename = require('gulp-rename')
const remark = require('gulp-remark')
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
const SITE_DESCRIPTION = '@kt3k の週報です | Weekly Journal of @kt3k'

const tmpl = tmpl =>
  layout1.nunjucks(tmpl, { data: { SITE_TITLE, SITE_DESCRIPTION } })
const acc = () => accumulate(paths.index, { debounce: 500, sort })
const md = () =>
  remark()
    .use(require('remark-slug'))
    .use(require('remark-align'))
    .use(require('remark-html'))

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
      const categories = file.contents
        .toString()
        .match(/^##\s.*$/gm)
        .map(s => s.replace(/^##\s*/, ''))
      return {
        year,
        week,
        start: m.startOf('isoWeek').format(DATE_FORMAT),
        end: m.endOf('isoWeek').format(DATE_FORMAT),
        basepath: getBasepath(file.relative),
        title,
        categories
      }
    })
  )
  .pipe(
    branch.obj(src => [
      src.pipe(tmpl('tmpl/shuho.md.njk')),
      src
        .pipe(acc())
        .pipe(tmpl('tmpl/index.md.njk'))
        .pipe(data({ basepath: getBasepath(paths.index) }))
    ])
  )
  .pipe(md())
  .pipe(tmpl('tmpl/layout.njk'))
