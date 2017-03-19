const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 8080;

// Configuration
app.set("view engine", "ejs");

// Middlewares
app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || "FunnyBunny"],

  maxAge: 24 * 60 * 60 * 1000
}));

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "funny-bunny"
  }
};

const urlDatabase = {
  "user3RandomID": {
    'dlkjt6': 'https://example.com/wow_wow_wow',
    'asdf': 'http://google.ca'
  },
  "userRandomID": {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xk": "http://www.google.com"
  },
  "user2RandomID": {
    'fe7F90': 'http://zombo.com'
  }
};

//function to add user specific url to urlDatabase
function addUrlToUser(userId, shortUrl, longUrl) {
  let userUrls = urlDatabase[userId];

  if (!userUrls) {
    userUrls = {};
    userUrls[shortUrl] = longUrl;
    urlDatabase[userId] = userUrls;
  } else {
    userUrls[shortUrl] = longUrl;
  }
}

//function to generate 6 random numbers and letters
function generateRandomString() {
  let randomString = "";
  let possCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++) {
    randomString += possCharacters.charAt(Math.floor(Math.random() * possCharacters.length));
  }
  return randomString;
}

//function to add a new user to user database
function addUser(email, password) {
  var newUserID = generateRandomString();

  users[newUserID] = {};

  //newUserID randomly generated
  users[newUserID].id = newUserID;
  //user will input email on form
  users[newUserID].email = email;
  //user will input password on form
  users[newUserID].password = password;

  return users[newUserID];
}

// Get root directory
app.get("/", (req, res) => {
  let user_id = req.session.user_id;

  let templateVars = {
    urls: urlDatabase[user_id],
    user: users[user_id]
  };
  if(req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
  res.render("urls_index", templateVars);
});

// Add endpoint for json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Get /urls
app.get("/urls", (req, res) => {
  let user_id = req.session.user_id;
  let user = users[user_id];

  if(user) {
    let templateVars = {
      urls: urlDatabase[user_id],
      user: user
    };
    res.render("urls_index", templateVars);
  } else {
    delete req.session.user_id;
    res.status(401).render("urls_401");
  }
});

// Get page for input form for new URLS
app.get("/urls/new", (req, res) => {
  // let user_id = req.cookies["user_id"];
  let user_id = req.session.user_id;
  let templateVars = {
    urls: urlDatabase[user_id],
    user: users[user_id]
  };

  // if(req.cookies["user_id"]) {
  if(req.session.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.status(401).render("urls_401");
  }
});

//console log out the (longurl) link that user input into the form
app.post("/urls", (req, res, next) => {
  console.log("req.body: ", req.body);

  let longURL = req.body.longURL;
  let shortURL = generateRandomString();

  if (req.session.user_id) {
    addUrlToUser(req.session.user_id, shortURL, longURL);
    res.redirect('/urls/' + shortURL);
    return;
  }

  res.status(401).render("urls_401");
  //redirect page
});

//if user inputs short url send them to the long url website
app.get("/u/:shortURL", (req, res) => {
  for (var userId in urlDatabase) {
    let longURL = urlDatabase[userId][req.params.shortURL];
    if (longURL !== undefined) {
      res.redirect(longURL);
      return;
    }
  }
  //this must be outside for loop or else it will loop around
  res.status(404).render("urls_404");
});

//add page for displaying a single URL and its shortened form
app.get("/urls/:shortURL", (req, res) => {
  let user_id = req.session.user_id;

  if(!req.session.user_id) {
    res.status(401).render("urls_401");
    return;
  }

  let shortURL = req.params.shortURL;


  console.log("url database: ", urlDatabase);
  console.log("user id", user_id);

  for (userId in urlDatabase){
    let userUrls = urlDatabase[userId];
    for (url in userUrls) {
      if (shortURL === url) {
        if (userId === user_id) {
          let longURL = urlDatabase[user_id][shortURL];

          let templateVars = {
            shortURL,
            longURL,
            urls: urlDatabase[user_id],
            user: users[user_id]
          };
          res.render("urls_show", templateVars);
        } else {
          res.status(403).render("urls_403");
        }
        return;
      }
    }
  }
  res.status(404).render("urls_404");
});

//delete to remove exisitng shortened uRLS from database
app.post("/urls/:shortURL/delete", (req, res) => {

  //check if logged in (cookie)
  if (req.session.user_id) {
    var userUrls = urlDatabase[req.session.user_id];
    //if logged in (can be hacked!),
    //so check if the url belongs to the logged in user
    //AND check that its not undefined
    if(userUrls && userUrls[req.params.shortURL] !== undefined) {
      delete userUrls[req.params.shortURL];
    } else {
      console.log("this message should never display!");
    }
  } else {
  //if not logged in
    res.status(401).render('urs_401');
  }


  //after delete redirect back to urls_index page
  res.redirect('/urls');
});

//update to exist existing urls
app.post("/urls/:shortURL", (req, res) => {
  //make the long url in object = to long url that was input in the form
  // urlDatabase[req.params.shortURL] = req.body.longURL;

  //check if logged in (cookie)
  if (req.session.user_id) {
    var userUrls = urlDatabase[req.session.user_id];
    //if logged in (can be hacked!),
    //so check if the url belongs to the logged in user
    //AND check that its not undefined
    if(userUrls && userUrls[req.params.shortURL] !== undefined) {
      userUrls[req.params.shortURL] = req.body.longURL;
    } else {
      console.log("this message should never display!");
    }
  } else {
  //if not logged in
    res.status(401).render('urs_401');
  }

  // addUrlToUser(req.cookies["user_id"], req.params.shortUrl, req.body.longURL);
  //after updating, redirect client back to index page
  res.redirect('/urls');
});

//add login page
app.get("/login", (req, res) => {
  res.render("urls_login");
});

//create log in route and set cookie for username
app.post("/login", (req, res) => {
  //check if input email matches an email in database

  //var matching is whether input email is same as database email
  //matching should always start as false
  var matching = false;
  var userId;

  //check if the email exists in database
  for(var user in users) {
    if (req.body.email === users[user].email ){
      matching = true;

      //find the correlating userID with the email
      userId = users[user].id;
      break;
    }
  }

  //if email does exist then do this:
  //matching is true if the matching is changed to true in the email match
  if(matching){
    //check if the input password matches the correlating email
    var matchPassword = bcrypt.compareSync(req.body.password, users[userId].password);
    if (matchPassword) {
      var newUser = addUser(req.body.email, req.body.password);
      // res.cookie('user_id', userId);
      req.session.user_id = userId;
      res.redirect('/urls');
      console.log("input pw", bcrypt.hashSync(req.body.password, 10));
      console.log("db pw", users[userId].password);
    } else {
      res.status(401).render("urls_401");
    }
  } else{
    res.status(401).render("urls_401");
  }
});

//log out and clear cookies and redirect
app.post("/logout", (req, res) => {
  delete req.session.user_id;
  // res.clearCookie(req.session.user_id);
  res.redirect('/');
});

//can delete? renders the registration page
app.get("/register", (req, res) => {
  if(req.session.user_id) {
    res.redirect("/");
  } else {
    res.render("urls_register");
  }
});

//create registration page
app.post("/register", (req, res) => {

  //check if email or password is input
  //send error if no email/pw input
  if(!req.body.email || !req.body.password) {
    res.status(400).send('Please input email and password');
    //return to end the response and don't excute code below
    return;
  }

  //now check if the input email already exists
  for (let randomID in users) {
    if(req.body.email === users[randomID].email) {
      res.status(400).send('Email already exists');
      //return so it doesn't excute code below
      return;
    }
  }

  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  //if all good, add new user object into the users database
  let newUser = addUser(req.body.email, hashedPassword);

  //set cookie for random generated id (comes from the object from addUser)
  //res.cookie('user_id', newUser.id);
  req.session.user_id = newUser.id;

  res.redirect('/');

  console.log(newUser);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});