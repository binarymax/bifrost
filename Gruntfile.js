module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		watch: {
			react: {
				files: 'examples/components/*.jsx',
				tasks: ['react']
			}
		},

		react: {
			combined_file_output: {
			  files: {
				'examples/todo.built.js': ['examples/components/*.jsx'],
			  }
			}
		}
	});

	grunt.loadNpmTasks('grunt-react');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', [
		'react'
	]);
};