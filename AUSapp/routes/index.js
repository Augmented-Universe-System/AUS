module.exports  = function(app) {

  /*
  * GET home page.
  */

  app.get('/', function(req, res){
    if (!req.user) {
      res.redirect('/login');
    }
    res.render('index', {
      title: 'AUS app',
      user: req.user
    });
  });

};
