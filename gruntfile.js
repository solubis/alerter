var webpack = require('webpack');
var grunt = require('grunt');

var saveVersion = function(version){
    var packageJSON = grunt.file.readJSON('package.json');
    var bowerJSON = grunt.file.readJSON('bower.json');

    if (!version) {
        throw new Error('Provide version parameter.');
    }

    packageJSON.version = version;
    bowerJSON.version = version;

    grunt.file.write('package.json', JSON.stringify(packageJSON, null, 4));
    grunt.file.write('bower.json', JSON.stringify(bowerJSON, null, 4));

    grunt.task.run('version');
}

var release = function () {
    var newVersion = grunt.option('setversion');
    var now = new Date();
    var date = '' + now.getFullYear() + now.getMonth() + now.getDate() + now.getHours() + now.getMinutes();

    if (!newVersion) {
        throw new Error('Provide --setversion parameter.');
    }

    if (/SNAPSHOT/.test(newVersion)) {
        console.log('SNAPSHOT build number: ' + date);
        saveVersion(newVersion + '.' + date);
    } else {
        console.log('RELEASE build with version: ' + newVersion);
        saveVersion(newVersion);

        grunt.task.run('changelog')
    }

    grunt.task.run('build');
}

module.exports = function (grunt) {

    'use strict';

    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({
        etc: 'etc',
        src: 'src',
        app: 'src',
        dist: 'dist',
        build: 'build',
        ui: 'lib/ui',
        core: 'lib/core',

        pkg: grunt.file.readJSON('package.json'),

        /* failed to integrate SystemJS builder so need to use webpack */

        webpack: {
            app: {
                entry: './build/compile/app.js',

                output: {
                    path: __dirname + '/build',
                    filename: 'app.js'
                }
            }
        },

        ngAnnotate: {
            options: {
                sourceMap: false,
                singleQuotes: true
            },
            app: {
                files: [{
                    expand: true,
                    src: '<%= build %>/compile/**/*.js'
                }]
            }
        },

        concat: {
            options: {
                separator: ';\n',
            },
            dist: {
                src: [
                    'lib/ui/dist/js/vendor.min.js',
                    'lib/ace-builds/src-min-noconflict/ace.js',
                    'lib/ace-builds/src-min-noconflict/mode-yaml.js',
                    'lib/ace-builds/src-min-noconflict/theme-xcode.js',
                    'lib/angular-ui-ace/ui-ace.min.js',
                    'lib/angular-drag-and-drop-lists/angular-drag-and-drop-lists.min.js',
                    'lib/ng-tags-input/ng-tags-input.min.js'
                ],
                dest: 'dist/js/vendor.min.js',
            },
            develop: {
                options: {
                    sourceMap: true,
                    sourceMapStyle: 'link'
                },
                src: [
                    'lib/ui/dist/js/vendor.js',
                    'lib/ace-builds/src/ace.js',
                    'lib/ace-builds/src/mode-yaml.js',
                    'lib/ace-builds/src/theme-xcode.js',
                    'lib/angular-ui-ace/ui-ace.js',
                    'lib/angular-drag-and-drop-lists/angular-drag-and-drop-lists.js',
                    'lib/ng-tags-input/ng-tags-input.js'
                ],
                dest: 'build/vendor.js',
            },
        },

        html2js: {
            options: {
                base: '<%= app %>',
                module: 'modules.html',
                quoteChar: '\'',
                useStrict: true

            },
            modules: {
                src: ['<%= app %>/modules/**/*.html'],
                dest: '<%= build %>/html.js'
            }
        },

        ts: {
            options: {
                module: 'commonjs',
                sourceMap: false,
                target: 'es5',
                removeComments: false,
                noResolve: true,
                noImplicitAny: false,
                preserveConstEnums: true,
                emitDecoratorMetadata: true,
                experimentalDecorators: true,
            },
            build: {
                src: ['<%= app %>/**/*.ts'],
                outDir: '<%= build %>/compile/'
            },
            develop: {
                options: {
                    inlineSourceMap: true,
                    inlineSources: true,
                },
                src: ['<%= app %>/**/*.ts']
            }
        },

        less: {
            options: {
                sourceMap: true
            },
            app: {
                options: {
                    sourceMapURL: 'app.css.map'
                },
                files: {
                    '<%= app %>/styles/app.css': '<%= app %>/styles/app.less'
                }
            }
        },

        cssmin: {
            options: {
                advanced: false,
                sourceMap: false
            },
            app: {
                files: {
                    '<%= dist %>/css/app.min.css': [
                        '<%= app %>/styles/app.css'
                    ]
                }
            }
        },

        processhtml: {
            dist: {
                options: {
                    process: true
                },
                files: {
                    '<%= dist %>/index.html': ['<%= app %>/index.html']
                }
            }
        },

        uglify: {
            options: {
                mangle: true,
                sourceMap: false
            },

            app: {
                files: {
                    '<%= dist %>/js/app.min.js': [
                        '<%= build %>/app.js'
                    ]
                }
            },

            html: {
                files: {
                    '<%= dist %>/js/html.min.js': [
                        '<%= build %>/html.js'
                    ]
                }
            }
        },

        copy: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= app %>/images/',
                    src: ['**'],
                    dest: '<%= dist %>/images/'
                }, {
                    expand: true,
                    cwd: '<%= app %>/fonts',
                    src: ['**'],
                    dest: '<%= dist %>/fonts/'
                }, {
                    src: '<%= app %>/favicon.ico',
                    dest: '<%= dist %>/favicon.ico'
                }, {
                    src: '<%= app %>/i18n.js',
                    dest: '<%= dist %>/i18n.js'
                }, {
                    src: '<%= app %>/launcher.html',
                    dest: '<%= dist %>/launcher.html'
                }, {
                    src: '<%= app %>/config.js',
                    dest: '<%= dist %>/config.js'
                }, {
                    src: '<%= ui %>/dist/js/ui.min.js',
                    dest: '<%= dist %>/js/ui.min.js'
                }, {
                    src: '<%= core %>/dist/js/core.min.js',
                    dest: '<%= dist %>/js/core.min.js'
                }]
            }
        },

        subgrunt: {
            options: {
                npmInstall: false
            },
            iqui: {
                'lib/ui': 'develop'
            },
            core: {
                'lib/core': 'develop'
            },
            buildUI: [
                'lib/ui'
            ],
            buildSecurity: [
                'lib/core'
            ],
        },

        browserSync: {
            develop: {
                bsFiles: {
                    src: [
                        'src/**/*.*',
                        '<%= ui %>/dist/js/*.js',
                        '<%= core %>/dist/js/*.js',
                        '<%= core %>/dist/css/*.css'
                    ]
                },
                options: {
                    server: {
                        baseDir: './'
                    },
                    index: 'index.html',
                    directory: true,
                    watchTask: true,
                    startPath: '/src/index.html'
                }
            },
            dist: {
                bsFiles: {
                    src: ['dist/**/*.*']
                },
                options: {
                    server: {
                        baseDir: './'
                    },
                    directory: true,
                    watchTask: false,
                    index: 'index.html',
                    startPath: '/dist/index.html'
                }
            },
            test: {
                options: {
                    server: {
                        baseDir: './'
                    },
                    open: false,
                    watchTask: false
                }
            }
        },

        /**
         * Warning: we don't watch for typsecript - better tools are in Atom or Webstorm
         */

        watch: {
            options: {
                livereload: true
            },

            grunt: {
                files: 'gruntfile.js',
                tasks: 'watch'
            },

            iqui: {
                files: ['<%= ui %>/src/**/*.js'],
                tasks: ['subgrunt:iqui']
            },

            less: {
                files: ['<%= ui %>/src/**/*.less', '<%= core %>/src/**/*.less', '<%= src %>/**/*.less'],
                tasks: ['less']
            },

            core: {
                files: ['<%= core %>/src/**/*.*'],
                tasks: ['subgrunt:core']
            },

            html: {
                files: ['<%= app %>/**/*.html'],
                tasks: 'html2js'
            },

            karma: {
                files: ['test/unit/*.js'],
                tasks: ['karma:continuous:run']
            },

            protractor: {
                files: ['test/e2e/*.js'],
                tasks: ['protractor:continuous']
            }

        },

        karma: {
            options: {
                configFile: 'test/karma.conf.js'
            },
            single: {
                singleRun: true
            },
            continuous: {
                background: true
            }
        },

        protractor: {
            options: {
                configFile: "test/protractor.conf.js",
                keepAlive: true,
                noColor: false
            },
            single: {
                options: {
                    keepAlive: false
                }
            },
            continuous: {
                options: {
                    keepAlive: true
                }
            }
        },

        /* BrowserSync does not work with Protractor so we need connect only for tests */

        connect: {
            options: {
                port: 3000,
                livereload: true,
                hostname: '*'
            },
            test: {
                options: {
                    base: ['./']
                }
            }
        },

        conventionalChangelog: {
            options: {
                changelogOpts: {
                    preset: 'angular'
                }
            },
            release: {
                src: 'CHANGELOG.md'
            }
        },

        version: {
            release: {
                src: ['<%= app %>/config.js', '<%= etc %>/config.js']
            }
        }

    });

    /* TODO Refactor - simplify */

    grunt.registerTask('develop', ['concat:develop', 'ts:develop', 'less']);

    grunt.registerTask('vendor', ['concat:dist']);
    grunt.registerTask('app', ['ts:build', 'ngAnnotate', 'webpack:app', 'uglify:app']);
    grunt.registerTask('html', ['html2js', 'uglify:html']);
    grunt.registerTask('css', ['less', 'cssmin']);

    grunt.registerTask('build', ['app', 'vendor', 'html', 'css', 'copy', 'processhtml']);

    grunt.registerTask('complete', ['subgrunt:buildUI', 'subgrunt:buildSecurity', 'build', 'test']);

    grunt.registerTask('unit', ['karma:continuous:start', 'watch:karma']);
    grunt.registerTask('e2e', ['connect:test', 'protractor:continuous', 'watch:protractor']);

    grunt.registerTask('test', ['connect:test', 'protractor:single', 'karma:single']);

    grunt.registerTask('server', ['browserSync:develop', 'watch']);
    grunt.registerTask('server:dist', ['browserSync:dist']);

    grunt.registerTask('default', ['develop']);
    grunt.registerTask('changelog', ['conventionalChangelog']);

    grunt.registerTask('release', 'Build for JENKINS release', release);
};
