var path = require('path'),
    metalsmith = require('metalsmith'),
    branch = require('metalsmith-branch'),
    permalinks = require('metalsmith-permalinks'),
    concat = require('metalsmith-concat'),
    uglify = require('metalsmith-uglify'),
    sitemap = require('metalsmith-sitemap'),
    filenames = require('metalsmith-filenames'),
    inPlace = require('metalsmith-in-place'),
    redirect = require('metalsmith-redirect'),
    browserSync = require('metalsmith-browser-sync');

var site = metalsmith(__dirname)

  // Metadata
  .metadata({
    site: {
      url: 'https://helloairtime.com',
      cdn: 'https://cdn.www.helloairtime.com',
      year: new Date().getFullYear(),
      analyticsId: 'UA-77773534-1'
    }
  })

  // Metalsmith
  .source('./src')
  .destination('./build')

  // JS
  .use(uglify())
  .use(concat({
    files: [
      'js/jquery.min.js',
      'js/main.min.js',
      'js/application.min.js'
    ],
    output: 'js/bundle.js'
  }))

  // Templates
  .use(filenames())
  .use(branch('**/*.html')
    .use(inPlace({
      engine: 'swig',
      basedir: './templates/',
      partials: 'partials'
    }))
  )
  .use(branch(['!index.html', '!404.html']).use(permalinks({
    relative: false
  })))

  // Sitemap
  .use(sitemap({
    output: 'sitemap.xml',
    urlProperty: 'path',
    hostname: 'http://helloairtime.com',
    pattern: '**/*.html',
    defaults: {
      priority: 0.5,
      changefreq: 'daily'
    }
  }))

  // BrowserSync it up!
  if (process.env.NODE_ENV !== 'production') {
    site = site
      .use(browserSync({
        server : 'build',
        files  : [
          'src/css/*.css',
          'src/js/*.js',
          'src/**/*.html',
          'templates/**/*.html'
        ]
      }))
  }

  // Errors
  site.build(function (err) {
    if (err) {
      console.log(err);
    }
    else {
      console.log('Site build complete!');
    }
  }
);
