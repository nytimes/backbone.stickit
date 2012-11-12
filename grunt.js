module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib');
  grunt.loadNpmTasks('grunt-docco');

  grunt.initConfig({
    
    pkg: '<json:package.json>',
    
    meta: {
      banner: '//\n' +
        '// <%= pkg.name %> - v<%= pkg.version %>\n' +
        '// The MIT License\n' +
        '// Copyright (c) 2012 The New York Times, CMS Group, Matthew DeLambo <delambo@gmail.com> \n' +
        '//'
    },

    lint: {
      all: ['backbone.stickit.js']
    },

    jshint: {
      options: {
        browser: true,
        indent: 1,
        white: false,
        evil: true,
        regexdash: true,
        wsh: true,
        trailing: true,
        eqnull: true,
        expr: true,
        boss: true,
        node: true,
        strict: false
      }
    },

    qunit: {
      all: ['http://localhost:8000/test/index.html']
    },

    server: {
      port: 8000,
      base: '.'
    },
    
    concat: {
      dist: {
        src: ['<banner>', '<file_strip_banner:backbone.stickit.js>'],
        dest: 'dist/backbone.stickit.js'
      }
    },
    
    min: {
      dist: {
        src: ['<banner>', 'dist/backbone.stickit.js'],
        dest: 'dist/backbone.stickit.min.js'
      }
    },

    docco: {
      app: {
        src: ['dist/backbone.stickit.js']
      }
    },

    compress: {
      zip: {
        files: {
          "dist/backbone.stickit.gz": "dist/backbone.stickit.min.js",
          "dist/backbone.stickit_<%= pkg.version %>.zip": ["dist/**"]
        }
      }
    },

    clean: {
      build: ['dist'],
      docco: ['docs']
    }
  });

  // qunit/phantomjs is mostly broken until the next release.
  // https://github.com/gruntjs/grunt/issues/219
  grunt.registerTask('test', 'server qunit');
  
  grunt.registerTask('build', 'lint clean:build concat min docco cp-docs clean:docco compress');
  
  grunt.registerTask('cp-docs', function() {
    grunt.file.copy('docs/docco.css', 'dist/docs/annotated/docco.css');
    grunt.file.copy('docs/backbone.stickit.html', 'dist/docs/annotated/index.html');
  });

};
