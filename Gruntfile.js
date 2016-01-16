var basePaths = {
	src: 'assets/src',
	dist: 'assets/dist'
};

var ftpLogin = {
	host: 'server.com',
	port: 21,
	authKey: 'key1'
};

module.exports = function (grunt) {
	grunt.option("src", basePaths.src);
	grunt.option("dist", basePaths.dist);

	grunt.initConfig({
		clean: {
			src: [basePaths.dist+'/**/*'],
		},
		
		copy: {
			main: {
				expand: true,
				cwd: basePaths.src+'/js/libs/',
				src: '*',
				dest: basePaths.dist+'/js/libs/',
				flatten: true,
				filter: 'isFile',
			},
		},

		svg_sprite: {
			src: [basePaths.src+'/images/svg/*.svg'],
			options: {
				dest: basePaths.dist,
				shape : {
					id : {
						// Nazvy souboru tvoricich sprite nesmi obsahovat znaky / a .
						generator : function(name) {
							name = name.replace(/\\/g,"/");
							item = name.split("/");
							return item[item.length - 1].slice(0, -4);
						}
					},
					spacing : {
						padding : 1,
					},
				},
				mode : {
					css : {
						mixin: 'sprite', // Nazev hlavni tridy s background-image
						sprite: '../img/sprite.svg', // Nazev vygenerovaneho spritu
						prefix: '.sprite-%s', // Nazev generovanych trid (.sprite-icon-name)
						dimensions: '-dims', // Suffix pro tridu vracejici rozmery
						render: {
							less: {
								dest: '../less/sprite.less',
								template: 'assets/tpl/template.less'
							}
						},
					},
					transform: ['svgo'],
				},
				variables : {
					png: function() {
						return function(sprite, render) {
							return render(sprite).split('.svg').join('.png');
						}
					}
				}
			}
		},

		svg2png: {
			all: {
				files: [{
					cwd: basePaths.dist+'/',
					src: ['img/*.svg'],
					dest: basePaths.dist+'/',
					expand: false
				}]
			}
		},

		concat: {
			styles: {
				// Kvuli spravnemu poradi je vypsano rucne
				src: [
					basePaths.src+'/less/reset.less', 
					basePaths.src+'/less/mixins.less',
					basePaths.dist+'/less/sprite.less',
					basePaths.src+'/less/fonts.less', 
					basePaths.src+'/less/variables.less',
					basePaths.src+'/less/typography.less',
					basePaths.src+'/less/site.less',
					basePaths.src+'/less/responsive.less',
					basePaths.src+'/less/utilities.less'
				],
				dest: basePaths.dist+'/less/style.less',
			},
		},

		less: {
			production: {
				files: {
					'<%= grunt.option(\"dist\") %>/css/style.css': '<%= grunt.option(\"dist\") %>/less/style.less'
				}
			}
		},

		cssmin: {
			options: {
				shorthandCompacting: false
			},
			target: {
				files: {
					'<%= grunt.option(\"dist\") %>/css/style.min.css': ['<%= grunt.option(\"dist\") %>/css/style.css']
				}
			}
		},

		uglify: {
			ugly: {
				files: {
					'<%= grunt.option(\"dist\") %>/js/global.min.js': ['<%= grunt.option(\"src\") %>/js/global.js']
				}
			}
		},

		watch: {
			scripts: {
				files: [basePaths.src+'/js/*.js'],
				tasks: ['uglify'],
				options: {
					spawn: false,
				},
			},
			sprite: {
				files: [basePaths.src+'/img/svg/*.svg'],
				tasks: ['svg_sprite', 'svg2png', 'concat', 'less', 'cssmin'],
				options: {
					spawn: false,
				},
			},
			styles: {
				files: [basePaths.src+'/less/*.less'],
				tasks: ['concat', 'less', 'cssmin'],
				options: {
					spawn: false,
				},
			},
		},

		notify: {
			options: {
				enabled: true,
				max_jshint_notifications: 5,
				success: false,
				duration: 3
			}
		}
	});

	// Tasky
	// 
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-svg-sprite');
	grunt.loadNpmTasks('grunt-svg2png');
	grunt.loadNpmTasks('grunt-imageoptim');
	grunt.loadNpmTasks('grunt-ftp-deploy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-notify');

	grunt.registerTask('init', ['clean', 'copy', 'uglify', 'svg_sprite', 'svg2png', 'concat', 'less', 'cssmin']);
	grunt.registerTask('default', ['init', 'watch', 'notify']);
}