/* eslint-disable camelcase */
/* eslint-disable func-style */
const express = require("express");
const bodyParser = require('body-parser');
//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());
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

let users = {
  '14512': {
    id: "14512",
    email: "a@gmail.com",
    password: "helloHELLO"
  },
  '14513': {
    id: "14513",
    email: "aba@gmail.com",
    password: "byeBYE"
  },

};

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

function getTheUserFromEmail(email)  {
  for (const key in users) {
    const user_ = users[key];
    if (user_.email === email) {
      return user_;
    }
  }
  return false;
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
  const hashedPassword = bcrypt.hashSync(password,10);
  const match = bcrypt.compareSync(password, hashedPassword);
  if (!email || !password) {
    return res.status(400).send('Please enter your email and password');
  }
  const user = getTheUserFromEmail(email);
  
  if (!user) {
    return res.status(403).redirect(403, '/register');
  }
  if (!match) {
    return res.status(403).send('Password does not match');
  }

  //res.cookie("user_id", user.id);
  req.session.user_id = user.id;
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
  res.redirect(`/urls/${newShort}`);
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
  console.log("data", urlDatabase);
  res.redirect('/urls');
});

app.post('/urls/:shortURL/edit',(req,res) => {//press EDIT button on the url page
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.status(401).send('Unauthorized action');
  }
  const shortURL = '/urls/' + req.params.shortURL;
  res.redirect(shortURL);
});

app.get('/register', (req,res) => {  
  const templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  res.render('registration', templateVars);
});
app.get('/login', (req,res)=> {
  const templateVars = { urls: urlDatabase, user: users[req.session.user_id]  };
  res.render('login', templateVars);
});

app.post('/register', (req,res) => { //Registration functionality
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password,10);
  
  if (!email || !password) {
    return res.status(400).send('Empty inputs');
  } else if (getTheUserFromEmail(email)) {
    return res.status(400).send('This email has already been used');
  }

  let newID = generateRandomString();
  users[newID] = {
    id: newID,
    email: req.body.email,
    password: hashedPassword
  };
  const user = getTheUserFromEmail(email);
  console.log("users", users);
  req.session.user_id = user.id;
  console.log("session----->", req.session.user_id);
  //res.cookie("user_id", newID);
  res.redirect('/urls');
  
});

// app.get("/", (req, res) => { //home page
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

app.get("/urls", (req, res) => { //urls page
  req.session.user_id;
  if (!req.session.user_id) {
    return res.render('error');
  }
  const allowed = urlsForUser(req.session.user_id);
  console.log(urlDatabase);
  console.log("arr", allowed);
  let allowObj = {};
  for (const key in urlDatabase) {
    for (const elem of allowed) {
      if (key === elem) {
        allowObj[key] = {
          longURL: urlDatabase[key].longURL,
          userID: urlDatabase[key].userID
        };
      }
    }
  }
  console.log("after filter", allowObj);
  const templateVars = { urls: allowObj, user: users[req.session.user_id]  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => { // new URL
  req.session.user_id;
  //console.log("UserID",req.cookies);
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