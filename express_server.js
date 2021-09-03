/* eslint-disable camelcase */
/* eslint-disable func-style */
const getTheUserFromEmail = require('./helpers');
const express = require("express");
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['apple']
}));

app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "hy125m"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "yyyyyy"
  }
};

let users = {};

function generateRandomString() { //random short URL
  let string = '';
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let i = 1;
  while (i <= 6) {
    string += characters.charAt(Math.floor(Math.random() * characters.length));
    i++;
  }
  return string;
}

function urlsForUser(id) {
  let allowed = [];
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      allowed.push(key);
    }
  }
  return allowed;
}

app.post('/login',(req,res) => { // Login functionality
  const email = req.body.email;
  const password = req.body.password;
  const user = getTheUserFromEmail(email,users);
  if (!email || !password) {
    return res.status(400).send('Please enter BOTH your email and password');
  }
  
  if (!user) {
    return res.status(403).send("no that user, please register first");
  }
  const match = bcrypt.compareSync(password,users[user].password);
  
  if (!match) {
    return res.status(403).send('Password does not match');
  }
  req.session.user_id = user;
  res.redirect('/urls');
});

app.post('/logout',(req,res) => {// Logout
  res.clearCookie('session', 'session.sig');
  res.redirect('/urls');
});

app.post('/urls', (req, res)=> {//addition new url to make short version
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.send('Please, register or login to get short urls :)');
  }
  let newShort = generateRandomString();
  urlDatabase[newShort] = {
    longURL: req.body.longURL,
    userID: user_id
  };//add new pair key-value to database
  res.redirect(`/urls/${newShort}`);//
});

app.post('/urls/:shortURL/delete', (req,res)=>{
  const user_id = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (!user_id) {
    return res.status(401).send('Unauthorized action');
  }
  
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req,res)=>{// press edit button on the single page
  const editedURL = req.body.url;
  const shortURL = req.params.shortURL;
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(401).send('Unauthorized action');
  }
  urlDatabase[shortURL] = {
    longURL: editedURL,
    userID: user_id
  };
  res.redirect('/urls');
});

app.post('/urls/:shortURL/edit',(req,res) => {//press EDIT button on the urls page
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(401).send('Unauthorized action');
  }
  const shortURL = '/urls/' + req.params.shortURL;
  res.redirect(shortURL);
});

app.get('/register', (req,res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    const templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
    return res.render('registration', templateVars);
  }
  res.redirect('/urls');
});
app.get('/login', (req,res)=> {
  const user_id = req.session.user_id;
  if (!user_id) {
    const templateVars = { urls: urlDatabase, user: users[req.session.user_id]  };
    return res.render('login', templateVars);
  }
  res.redirect('/urls');

});

app.post('/register', (req,res) => { //Registration functionality
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password,10);
  
  if (!email || !password) {
    return res.status(400).send('Empty inputs');
  } else if (getTheUserFromEmail(email, users)) {
    return res.status(400).send('This email has already been used');
  }

  let newID = generateRandomString();
  users[newID] = {
    id: newID,
    email: req.body.email,
    password: hashedPassword
  };
  const user = getTheUserFromEmail(email, users);
  req.session.user_id = user;
  res.redirect('/urls');
  
});

app.get("/", (req, res) => { //home page
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.redirect('/login');
  }
  res.redirect('/urls');
});

app.get("/urls", (req, res) => { //urls page
  const user_id = req.session.user_id;
  if (!user_id) {
    const templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
    return res.render('error', templateVars);
  }
  const allowed = urlsForUser(req.session.user_id);
  let allowObj = {};
  for (const key in urlDatabase) {
    for (const elem of allowed) {
      if (key === elem) {//looking for only matched
        allowObj[key] = {
          longURL: urlDatabase[key].longURL,
          userID: urlDatabase[key].userID
        };
      }
    }
  }
  
  const templateVars = { urls: allowObj, user: users[req.session.user_id]};//pass filtered object for display

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => { // new URL
  req.session.user_id;
  if (!req.session.user_id) {
    res.redirect('/login');
  }
  const templateVars = { user: users[req.session.user_id]  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  req.session.user_id;
  if (!req.session.user_id) {
    return res.status(401).send("Please login first");
  }
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID && urlDatabase[shortURL].userID !== req.session.user_id) {
    return res.status(403).send('Unauthorized action');
  }
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = { shortURL, longURL, user: users[req.session.user_id]  };
  if (!urlDatabase[shortURL]) { //edge case with not existing shortURL
    res.redirect('/urls');
    return;
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => { //redirection from short URL to original URL
  const shortURL = req.params.shortURL;
  for (let key in urlDatabase) {
    if (key === shortURL) {
      const longURL = urlDatabase[shortURL].longURL;
      return res.redirect(longURL);
    }
  }
  return res.status(404).send("Mistake in url");

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});