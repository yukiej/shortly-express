const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, '../public')));



app.get('/',
  (req, res) => {
    res.render('index');
  });

app.get('/create',
  (req, res) => {
    res.render('index');
  });

app.get('/links',
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({
        url
      })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({
          id: results.insertId
        });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

app.get('/signup',
  (req, res) => {
    res.render('signup');
  });

app.post('/signup',
  (req, res) => {
    models.Users.create(req.body)
      .then( () => {
        res.status(201).send('Signed Up');
      })
      .error(error => {
        res.status(500).send(error);
      });
  });
/************************************************************/
// Write your authentication routes here
/************************************************************/

app.get('/login',
  (req, res) => {
    res.render('login');
  });

app.post('/login',
  (req, res) => {
    //{ username: 'name', password: 'qw' }
    
    let userId = req.body.username;
    let attemptedPW = req.body.password;
    
    // console.log('USER IS: ', userId, password);
    models.Users.get({username: userId})
      .then( user => {
        if (user === undefined) {
          // not a member
          console.log('not a member');
          res.status(500).send('not a member');
        } else {
          let password = user.password;
          let salt = user.salt;
          let checker = models.Users.compare(attemptedPW, password, salt);
          
          if (checker) {
            console.log('member');
            res.status(200).send('Logged In');
            //TO DO: Send user to logged in page
          } else {
            console.log('Wrong PW'); 
            res.status(500).send('Wrong PW');
          }
        }
      });
      
    // models.Users.getAll()
    //   .then(eachUser => {
    //     console.log(eachUser);
    //     let allUserArr = eachUser.map( e => {
    //       return e.username;
    //     });
    //     if ( allUserArr.includes(userId) ) { 
    //       // the person is a member!
    //       // let's compare the password
    //       console.log('member'); 
    //     } else {
    //       // the person is a not member!
    //       console.log('not a member'); 
    //     }
    //   });
  });

/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({
      code: req.params.code
    })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({
        linkId: link.id
      });
    })
    .tap(link => {
      return models.Links.update(link, {
        visits: link.visits + 1
      });
    })
    .then(({
      url
    }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;