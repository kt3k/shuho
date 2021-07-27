import {
  dest,
  mux,
  on,
  serve,
  src,
  tee,
} from "https://deno.land/x/rio@v0.0.1/mod.ts";
import { md } from "https://deno.land/x/rio@v0.0.1/plugins/md.ts";
import { layout } from "https://deno.land/x/rio@v0.0.1/plugins/layout.ts";
import { rename } from "https://deno.land/x/rio@v0.0.1/plugins/rename.ts";
import { collect } from "https://deno.land/x/rio@v0.0.1/plugins/collect.ts";
import { frontmatter } from "https://deno.land/x/rio@v0.0.1/plugins/frontmatter.ts";
import { data } from "https://deno.land/x/rio@v0.0.1/plugins/data.ts";
import {
  dirname,
  join,
  relative,
} from "https://deno.land/std@0.101.0/path/mod.ts";
import moment from "https://esm.sh/moment";

const PORT = 7070;

const paths = {
  index: "index.html",
  dest: "dist",
  assets: "assets/**/*.*",
  posts: "2*/*.md",
};

const langIcon = {
  ja: "🇯🇵",
  en: undefined,
} as const;

type D = {
  data: {
    date: moment.Moment;
  };
};

const sort = (x: D, y: D): number => y.data.date.diff(x.data.date);
const getBasepath = (path: string) => join(".", relative(dirname(path), ""));
const DATE_FORMAT = "M/D";
const SITE_TITLE = "@kt3k の週報 | Weeknotes of @kt3k";
const SITE_DESCRIPTION = "@kt3k の週報です | Weeknotes of @kt3k";
const DOMAIN = "shuho.kt3k.org";

on(
  "dev",
  "serve assets at port " + PORT,
  () => serve(weeknotes({ watch: true }), { port: PORT }),
);
on("dist", "build assets to dist", () => dest(weeknotes(), paths.dest));

const DATA = { SITE_TITLE, SITE_DESCRIPTION, DOMAIN };

function weeknotes(opts: { watch?: boolean } = {}) {
  const s = data(
    frontmatter<{ lang: string }>(src(paths.posts, opts)),
    fileToArticle,
  );
  const [s0, s1] = tee(s);
  const s2 = mux(
    layout(
      collect(s0, "index.md", { debounce: 500, sort }),
      "tmpl/index.md.njk",
      DATA,
    ),
    layout(s1, "tmpl/post.md.njk", DATA),
  );
  const s3 = rename(md(s2), { extname: ".html" });
  const s4 = layout(s3, "tmpl/layout.njk", DATA);
  return mux(s4, src(paths.assets, opts));
}

type Article = {
  year: string;
  week: string;
  isLastWeek: boolean;
  date: moment.Moment;
  start: string;
  end: string;
  basepath: string;
  title: string;
  categories: string[] | undefined;
  lang: "ja" | "en";
  langIcon: string | undefined;
} & File;

const decoder = new TextDecoder();

const fileToArticle = async (
  file: File & { frontMatter: { lang?: "en" | "ja" } },
): Promise<Article> => {
  const m = moment(file.name, "YYYY/MM-DD.md");
  const year = m.isoWeekday(4).format("YYYY");
  const week = m.format("W");
  // If the next week is the first week, then it's the last week of the year
  const isLastWeek = m.clone().add(7, "days").format("W") === "1";
  const title = `Week ${week} - ${year}`;
  const bytes = await file.arrayBuffer();
  const categories = decoder
    .decode(new Uint8Array(bytes))
    .match(/^##\s.*$/gm)
    ?.map((s: string) => s.replace(/^##\s*/, ""));
  const lang = file.frontMatter.lang || "en";
  const r = new File([bytes], file.name);
  return Object.assign(r, {
    year,
    week,
    isLastWeek,
    date: m.clone(),
    start: m.startOf("isoWeek").format(DATE_FORMAT),
    end: m.endOf("isoWeek").format(DATE_FORMAT),
    basepath: getBasepath(file.name),
    title,
    categories,
    lang,
    langIcon: langIcon[lang],
  });
};
