const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 8080; //default port 8080


// Configuration
app.set("view engine", "ejs");

// Middlewares
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


const users = {
  "userRandomID" : {
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
    password: "funny-bunny",
  }
};

const urlDatabase = {
  "user3RandomID": {
    'd;lkjt6': 'https://example.com/wow_wow_wow',
    'asdf': 'http://google.ca'
  },
  "userRandomID" : {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xk": "http://www.google.com"
  },
  "user2RandomID" : {
    'qqqq': 'http://zombo.com'
  }
};

  //   "b2xVn2": {
  //     url: "http://www.lighthouselabs.ca",
  //     user: ""
  //   }
  //   "9sm5xk": "http://www.google.com"
  // }


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


function addUser(email, password) {
  var newUserID = generateRandomString(); //should be randomly generated

  users[newUserID] = {};

  users[newUserID].id = newUserID; //random generated with old function
  users[newUserID].email = email; //user will input
  users[newUserID].password = password; //user will input

  return users[newUserID];
}


//add endpoint for root directory
app.get("/", (req, res) => {
  res.end("Hello!");
});
//add additional endpoint
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//add route with html response

//add route handler for urls
app.get("/urls", (req, res) => {

  //read the value of the cookie

  let user_id = req.cookies["user_id"];
  let templateVars = {
    urls: urlDatabase[user_id],
    user: user_id
  };
  res.render("urls_index", templateVars);
  //res.render("urls_index",{user:flag});
});

//add page for url input form
app.get("/urls/new", (req, res) => {
  let user_id = req.cookies["user_id"];
  let templateVars = {
    urls: urlDatabase[user_id],
    user: user_id
  };

  if(req.cookies["user_id"]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//console log out the (longurl) link that user input into the form
app.post("/urls", (req, res, next) => {
  console.log("req.body: ", req.body);

  let longURL = req.body.longURL;
  let shortURL = generateRandomString();

  //add new longurl & short url to the urldatabse obj
  // urlDatabase[shortURL] = longURL;
  addUrlToUser(req.cookies["user_id"], shortURL, longURL);

  //redirect page
  res.redirect('/urls/'+shortURL);
});

//if user inputs short url send them to the long url website
app.get("/u/:shortURL", (req, res) => {
  for (var userId in urlDatabase) {
    let longURL = urlDatabase[userId][req.params.shortURL];
      console.log("FOUND IT", urlDatabase);
      console.log("shortURL:", req.params.shortURL);
      console.log("longURL:", longURL);
    if (longURL !== undefined) {
      res.redirect(longURL);
      return;
    }
  }
  res.status(404).send('url does not exist');//must be outside for loop or else it will loop around
})



//add page for displaying a single URL and its shortened form
app.get("/urls/:shortURL", (req, res) => {
  let user_id = req.cookies["user_id"];

  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[user_id][shortURL];

  let templateVars = {
    shortURL,
    longURL,
    user: users[user_id]
  }
  res.render("urls_show", templateVars);
});

//delete to remove exisitng shortened uRLS from database
app.post("/urls/:shortURL/delete", (req, res) => {


  // delete urlDatabase[req.params.shortURL];
  delete urlDatabase[req.cookies.user_id][req.params.shortURL];


  //after delete redirect back to urls_index page
  res.redirect('/urls');
});

//update to exist existing urls
app.post("/urls/:shortURL", (req, res) => {
  //make the long url in object = to long url that was input in the form
  // urlDatabase[req.params.shortURL] = req.body.longURL;
  urlDatabase[req.cookies.user_id][req.params.shortURL] = req.body.longURL;
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
  var matching = false; //always start as false
  var userId;

  //check if the email exists in database
  for(var user in users) {
    if (req.body.email === users[user].email ){
      matching = true;

      //find the correlating userID with the email
      userId = users[user].id;
      break;
    }  //if bracket ends here
  }

  //if email does exist then do this:
  if(matching){ //matching is true if the matching is changed to true in the email match
    //check if the input password matches the correlating email
    if (req.body.password === users[userId].password) {
      var newUser = addUser(req.body.email, req.body.password);
      res.cookie('user_id', userId);
      res.redirect('/urls');
    }
    //if not send a 403 status
    else {
      res.status(403).send('Email and password do not match');
    }
  }
  //if email DOESNT exist, send 403 status
  else{
    res.status(403).send('Email does not exist');
    //res.redirect('/login');
  }
});

//log out and clear cookies and redirect
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//can delete? renders the registration page
app.get("/register", (req, res) => {
    res.render("urls_register");
});

//create registration page
app.post("/register", (req, res) => {

  //check if email or password is input
  //send error if no email/pw input
  if(!req.body.email || !req.body.password) {
    res.status(400).send('Please input email and password'); // should this be res.status?
    return; //end the response and don't excute code below
  }

  //now check if the input email already exists
  for (let randomID in users) {
    if(req.body.email === users[randomID].email) {
      res.status(400).send('Email already exists');
      return; //don't excute code below
    }
  }

  //add new user object into the user object
  let newUser = addUser(req.body.email, req.body.password);   //now can call user.email user.password etc

  //set cookie for random generated id (comes from the object from addUser)
  res.cookie('user_id', newUser.id);
  res.redirect('/urls');

  console.log(newUser);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})