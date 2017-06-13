const { BasicStrategy } = require('passport-http');
const express = require('express');
const jsonParser = require('body-parser').json();
const passport = require('passport');
const cfg = require('../config');
var jwt = require("jwt-simple");
// var auth = require("./auth.js")();
var users = require("./users.js");
const { User } = require('./models');

const router = express.Router();

router.use(jsonParser);
// router.use(passport.initialize());
// router.use(auth.initialize());


// router.get("/", auth.authenticate(), function (req, res) {
//   res.json(users[req.user.id]);
// });

router.post("/token", function (req, res) {
  console.log(req.body);
  if (req.body.username && req.body.password) {
    var username = req.body.username;
    var password = req.body.password;
    console.log(username, password);
    User.findOne({ username: username })
      .then((user) => {
        user.validatePassword(password)
          .then(() => {
            res.json({token: jwt.encode({id: user.id}, cfg.JWT.jwtSecret)});
          }).catch(err => console.log(err))
      }
      )
  }
  else {
    res.sendStatus(401);
  }
});

router.post("/", function (req, res) {
  User.hashPassword(req.body.password)
    .then((hashedPassword) => {
      User
        .create(
        {
          username: req.body.username,
          password: hashedPassword,
          firstName: req.body.firstName,
          lastName: req.body.lastName
        }
        )
        .then(user => res.status(201).json(user.apiRepr()))
        .catch(err => {
          console.log(err);
          res.status(500).json({ message: "Internal server error" });
        });
    })

});










//--------------------------------------------------------------------------------------------------------

// NB: at time of writing, passport uses callbacks, not promises
// const basicStrategy = new BasicStrategy((username, password, callback) => {
//   let user;
//   User
//     .findOne({username: username})
//     .exec()
//     .then(_user => {
//       user = _user;
//       if (!user) {
//         return callback(null, false, {message: 'Incorrect username'});
//       }
//       return user.validatePassword(password);
//     })
//     .then(isValid => {
//       if (!isValid) {
//         return callback(null, false, {message: 'Incorrect password'});
//       }
//       else {
//         return callback(null, user)
//       }
//     });
// });


// passport.use(basicStrategy);



// router.post('/', (req, res) => {
//   if (!req.body) {
//     return res.status(400).json({message: 'No request body'});
//   }

//   if (!('username' in req.body)) {
//     return res.status(422).json({message: 'Missing field: username'});
//   }

//   let {username, password, firstName, lastName} = req.body;

//   if (typeof username !== 'string') {
//     return res.status(422).json({message: 'Incorrect field type: username'});
//   }

//   username = username.trim();

//   if (username === '') {
//     return res.status(422).json({message: 'Incorrect field length: username'});
//   }

//   if (!(password)) {
//     return res.status(422).json({message: 'Missing field: password'});
//   }

//   if (typeof password !== 'string') {
//     return res.status(422).json({message: 'Incorrect field type: password'});
//   }

//   password = password.trim();

//   if (password === '') {
//     return res.status(422).json({message: 'Incorrect field length: password'});
//   }

//   // check for existing user
//   return User
//     .find({username})
//     .count()
//     .exec()
//     .then(count => {
//       if (count > 0) {
//         return res.status(422).json({message: 'username already taken'});
//       }
//       // if no existing user, hash password
//       return User.hashPassword(password)
//     })
//     .then(hash => {
//       return User
//         .create({
//           username: username,
//           password: hash,
//           firstName: firstName,
//           lastName: lastName
//         })
//     })
//     .then(user => {
//       return res.status(201).json(user.apiRepr());
//     })
//     .catch(err => {
//       res.status(500).json({message: 'Internal server error'})
//     });
// });

// // never expose all your users like below in a prod application
// // we're just doing this so we have a quick way to see
// // if we're creating users. keep in mind, you can also
// // verify this in the Mongo shell.
// router.get('/', (req, res) => {
//   return User
//     .find()
//     .exec()
//     .then(users => res.json(users.map(user => user.apiRepr())))
//     .catch(err => console.log(err) && res.status(500).json({message: 'Internal server error'}));
// });




// router.get('/me',
//   passport.authenticate('basic', {session: false}),
//   (req, res) => res.json({user: req.user.apiRepr()})
// );


module.exports = router;
