'use strict';

const express = require('express');
// const bcrypt = require('bcrypt-as-promised');

// eslint-disable-next-line new-cap
const app = express();
const router = express.Router();
const knex = require('../knex.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-as-promised');
const humps = require('humps');

router.get('/token', (req, res, next) => {
  jwt.verify(req.cookies.token, process.env.JWT_KEY, (err) => {
    if (err) {
      res.set('Content-Type', 'application/json');
      res.status(200).send(false);
    }
    else {
      res.set('Content-Type', 'application/json');
      res.status(200).send(true);
    }
  });
});

router.post('/token', (req, res, next) => {
  knex('users').where('email', '=', req.body.email).then((userDataArray) => {
    const userInfo = userDataArray[0];
    bcrypt.compare(req.body.password, userInfo.hashed_password).then((userAuth) => {
      if (userAuth) {
        const claim = { userId: req.body.email }; // this is our 'session'

        const token = jwt.sign(claim, process.env.JWT_KEY, { // use this environment variable to sign the cookie
          expiresIn: '7 days'  // Adds an exp field to the payload
        });

        const opts = {
          httpOnly: true,
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),  // 7 days
          secure: router.get('env') === 'production'  // Set from the NODE_ENV
        };

        res.cookie('token', token, opts);
        const responseObj = {
          id: userInfo.id,
          firstName: userInfo.first_name,
          lastName : userInfo.last_name,
          email: userInfo.email
        }

        res.status(200).send(responseObj);
      } else {
        res.status(200).send(false);
      }
    });
  });
});

router.delete('/token', (req, res) => {
  
});




module.exports = router;
