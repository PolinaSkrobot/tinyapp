/* eslint-disable func-style */
const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));
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

app.post('/urls', (req, res)=> { //addition new url to make short version

  let newShort = generateRandomString();
  urlDatabase[newShort] = req.body.longURL;//add new pair key-value to database
  res.redirect(`/urls/${newShort}`);
});
app.post('/urls/:shortURL/delete', (req,res)=>{
  console.log('hhhh');
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
})
app.get("/", (req, res) => { //home page
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => { //urls page
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  const shortURL = req.params.shortURL;
  //console.log();
  if (!urlDatabase[shortURL]) {
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