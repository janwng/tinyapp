var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; //default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

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

app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("Ok");
});


//add page for displaying a single URL and its shortened form
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];

  let templateVars = { shortURL, longURL }
  res.render("urls_show", templateVars);
});

















app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})