module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    lint: {
      all: ['backbone.stickit.js']
    },

    jshint: {
      src: ['backbone.stickit.js'],
      options: {
        browser: true,
        indent: 2,
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
      all: {
        options: {
          urls: ['http://localhost:3000/test/index.html']
        }
      }
    },

    server: {
      port: 8000,
      base: '.'
    },

    concat: {
      options: {
        stripBanners: true,
        banner: '//\n' +
          '// <%= pkg.name %> - v<%= pkg.version %>\n' +
          '// The MIT License\n' +
          '// Copyright (c) 2012 The New York Times, CMS Group, Matthew DeLambo <delambo@gmail.com> \n' +
          '//\n'
      },
      dist:{
        files: [{
          src: 'backbone.stickit.js',
          dest: 'dist/backbone.stickit.js'
        }, {
          src: 'backbone.stickit.amd.js',
          dest: 'dist/backbone.stickit.amd.js'
        }]
      } 
    },

    rig: {
      browser: {
        files: {
          'dist/<%= pkg.name %>.js': ['<%= pkg.name %>.js']
        }
      },
      amd: {
        files: {
          'dist/<%= pkg.name %>.amd.js': ['<%= pkg.name %>.amd.js']
        }
      }
    },
    uglify: {
      options: {
        banner: '//\n' +
          '// <%= pkg.name %> - v<%= pkg.version %>\n' +
          '// The MIT License\n' +
          '// Copyright (c) 2012 The New York Times, CMS Group, Matthew DeLambo <delambo@gmail.com> \n' +
          '//\n'
      },
      nasty: {
        options: {
          preserveComments: false
        },
        files: {
          'dist/backbone.stickit.min.js': ['backbone.stickit.js'],
          'dist/backbone.stickit.amd.min.js': ['backbone.stickit.amd.js']
        }
      }
    },

    docco: {
      app: {
        src: ['dist/backbone.stickit.js'],
        dest: "docs/"
      }
    },

    compress: {
      gz: {
        options: {
          archive: 'dist/backbone.stickit.gz'
        },
        files: ['dist/backbone.stickit.min.js', 'dist/backbone.stickit.amd.min.js'] 
      },
      zip: {
        options: {
          archive: 'dist/backbone.stickit_<%= pkg.version %>.zip'
        },
        files: [
          {src: './**', cwd: 'dist/', expand:true}
        ]
      }
    },

    clean: {
      build: ['dist'],
      docco: ['docs']
    }
  });

  grunt.loadNpmTasks('grunt-docco');
  grunt.loadNpmTasks('grunt-rigger');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.registerTask('build', ['jshint', 'clean:build', 'uglify:nasty', 'concat', 'rig', 'docco', 'compress:gz', 'cp-docs', 'compress:zip']);

  grunt.registerTask('cp-docs', function() {
    grunt.file.copy('docs/docco.css', 'dist/docs/annotated/docco.css');
    grunt.file.copy('docs/backbone.stickit.html', 'dist/docs/annotated/index.html');
  });

};
