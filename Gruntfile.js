module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            react: {
                files: 'examples/createLocal/components/todo.jsx',
                tasks: ['react']
            }
        },

        react: {
            combined_file_output: {
              files: {
                'examples/createLocal/todo.built.js': ['examples/createLocal/components/todo.jsx']
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