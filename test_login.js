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


function checkLogin(email) {

  for(var user in users) {

    if (email === users[user].email ){
      console.log('matching', user);

      console.log(users[user].password);
      break;
    }

  }

}

checkLogin("user2@example.com");