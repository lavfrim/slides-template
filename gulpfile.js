import gulp from 'gulp';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import concatCss from 'gulp-concat-css';
import clean from 'gulp-clean';
import fs from 'fs';

const { src, dest, series, parallel, watch } = gulp;
const scss = gulpSass(dartSass);
const PAGES_LINT_MARKER = '<!-- pages list place, replace automatically -->';

// Common and pages
export const buildCommonStyle = () => src('src/common/styles/*.scss')
    .pipe(scss().on('error', scss.logError))
    .pipe(concatCss('style.css'))
    .pipe(dest('output/common'));
export const buildPageStyle = () => src('src/pages/**/*.scss', { base: 'src' })
    .pipe(scss().on('error', scss.logError))
    .pipe(dest('output'));
export const buildStyle = parallel(buildCommonStyle, buildPageStyle);

export const buildCommonScripts = () => src('src/common/**/*.js', { base: 'src/common' })
    .pipe(dest('output/common'));
export const buildPageScripts = () => src('src/pages/**/*.js', { base: 'src' })
    .pipe(dest('output'));
export const buildScripts = parallel(buildCommonScripts, buildPageScripts);

export const buildHtml = () => src('src/pages/**/*.html', { base: 'src' }).pipe(dest('output'));
export const buildAssets = () => src(['src/pages/**/**', '!src/pages/**/*.scss', '!src/pages/**/*.html', '!src/pages/**/*.js'], { base: 'src' }).pipe(dest('output'));

// Main page
export const createPageList = (done) => {
    const files = fs.readdirSync('src/pages').filter((path) => !path.includes('.'));
    const mainHtml = fs.readFileSync('src/index.html', 'utf8');

    const linkList = files.map(
        (page) =>
            `<li><a id="page-link--${page}" href="./pages/${page}/index.html">${page}</a></li>`
    ).join('\n        ');

    const html = mainHtml.replace(PAGES_LINT_MARKER, linkList)

    fs.writeFileSync('output/index.html', html);

    done()
}
export const buildMainHtml = () => src('src/*.html', { base: 'src' }).pipe(dest('output'));
export const buildMainScript = () => src('src/*.js', { base: 'src' }).pipe(dest('output'));
export const buildMain = series(
    buildAssets,
    parallel(buildMainHtml, buildMainScript),
    createPageList
);

// Scripts
export const cleanOutput = () => src('output', { read: false, allowEmpty: true }).pipe(clean());

export const build = series(cleanOutput, buildStyle, buildScripts, buildHtml, buildMain);

export default build