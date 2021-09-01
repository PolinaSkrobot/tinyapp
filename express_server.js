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

app.post('/login',(req,res) => { // Login functionality
  res.cookie("username", req.body.username);
  res.redirect('/urls');
});

app.post('/logout',(req,res) => {// Logout
  res.clearCookie('username');
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

app.get("/", (req, res) => { //home page
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => { //urls page
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => { // new URL
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = { shortURL, longURL, username: req.cookies["username"]};
  
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