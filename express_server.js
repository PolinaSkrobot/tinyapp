/* eslint-disable func-style */
const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
function foundUser(userID) {
  for (const key in users) {
    const user = users[key];
    if (user.id === userID) {
      return user;
    }
  }
  return "no there";
   
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

app.post('/login',(req,res) => { // Login functionality
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send('Empty inputs');
  }
  const user = getTheUserFromEmail(email);
  
  if (!user) {
    return res.status(403).send('no user with that email found');
  }
  if (user.password !== password) {
    return res.status(403).send('password does not match');
  }

  res.cookie("user_id", user.id);
  res.redirect('/urls');
});

app.post('/logout',(req,res) => {// Logout
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/urls', (req, res)=> { //addition new url to make short version
  let newShort = generateRandomString();
  urlDatabase[newShort] = req.body.longURL;//add new pair key-value to database
  res.redirect(`/urls/${newShort}`);
});

app.post('/urls/:shortURL/delete', (req,res)=>{
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req,res)=>{// press edit button on the single page
  const editedURL = req.body.url;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = editedURL;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/edit',(req,res) => {//press EDIT button on the url page
  const shortURL = '/urls/' + req.params.shortURL;
  res.redirect(shortURL);
});

app.get('/register', (req,res) => {
  const templateVars = { urls: urlDatabase , user: foundUser(req.cookies["user_id"])};
  res.render('registration', templateVars);
});
app.get('/login', (req,res)=> {
  const templateVars = { urls: urlDatabase , user: foundUser(req.cookies["user_id"])};
  res.render('login', templateVars);
});

app.post('/register', (req,res) => { //Registration functionality
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    return res.status(400).send('Empty inputs');
  } else if (getTheUserFromEmail(email)) {
    return res.status(400).send('This email has already been used');
  }

  let newID = generateRandomString();
  users[newID] = {
    id: newID,
    email: req.body.email,
    password: req.body.password
  };
  
  res.cookie("user_id", newID);
  res.redirect('/urls');
  
});

app.get("/", (req, res) => { //home page
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => { //urls page
  console.log("__________", req.cookies["user_id"]);
  console.log('******', foundUser(req.cookies["user_id"]));
  const templateVars = { urls: urlDatabase, user: foundUser(req.cookies["user_id"])  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => { // new URL
  const templateVars = { user: foundUser(req.cookies["user_id"])  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = { shortURL, longURL, user: foundUser(req.cookies["user_id"])  };
  
  if (!urlDatabase[shortURL]) { //edge case with not existing shortURL
    res.redirect('/urls');
    return;
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => { //redirection from short URL to original URL
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});