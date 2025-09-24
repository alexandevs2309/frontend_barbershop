// Karma configuration for headless testing
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        random: false
      },
      clearContext: false
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/sakai-ng'),
      subdir: '.',
      reporters: [
        { type: 'text-summary' },
        { type: 'lcov' }
      ]
    },
    reporters: ['progress'],
    browsers: ['Firefox'],
    restartOnFileChange: true,
    singleRun: true
  });
};