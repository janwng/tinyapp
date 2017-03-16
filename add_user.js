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
    password: "funny-bunny"
  }
};

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
  var newUser = generateRandomString(); //should be randomly generated

  users[newUser] = {};

  users[newUser].id = newUser; //random generated with old function
  users[newUser].email = email; //user will input
  users[newUser].password = password; //user will input

  return users[newUser];
}

addUser('test@gmail.com', 'test');
console.log(users);
