var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; //default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

//function to generate 6 random numbers and letters
function generateRandomString() {
  var randomString = "";
  var possCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++) {
    randomString += possCharacters.charAt(Math.floor(Math.random() * possCharacters.length));
  }

return randomString;
}


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};

// app.param('shortURL', (req, res, next) => {
//   console.log('In params middleware');
//   res.locals.shortURL = req.params.shortURL;

//   next();
// });

// app.use((req, res, next) => {
//   console.log('In time middleware');
//   res.locals.currentTime = new Date();
//   next();
// })

//add endpoint for root directory
app.get("/", (req, res) => {
  res.end("Hello!");
});
//add additional endpoint
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//add route with html response
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n")
});
//add route handler for urls
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//add page for url input form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//log out the (longurl) link that user input into the form
app.post("/urls", (req, res, next) => {
  console.log("req.body: ", req.body);
  // res.send("Ok");

  let longURL = req.body.longURL;
  let shortURL = generateRandomString();

  //add new longurl & short url to the urldatabse obj
  urlDatabase[shortURL] = longURL;

//   console.log(urlDatabase);
// }, function(req, res) {

  //redirect page
  res.redirect('/urls/'+shortURL);
});

//if user inputs short url send them to the long url website
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
})




//add page for displaying a single URL and its shortened form
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];

  let templateVars = { shortURL, longURL }
  res.render("urls_show", templateVars);
});

















app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})