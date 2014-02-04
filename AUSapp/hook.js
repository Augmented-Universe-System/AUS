var gith = require('gith').create(9001);

gith({
  repo: 'Augmented-Universe-System/AUS',
  branch: 'develop'
}).on( 'all', function(payload) {
  var util = require('util'),
      exec = require('child_process').exec,
      child;

  child = exec('. /home/project/AUS/deploy-develop.sh', // command line argument directly in string
    function (error, stdout, stderr) {      // one easy function to capture data/errors
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
  });
});
