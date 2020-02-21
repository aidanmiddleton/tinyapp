const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

function generateRandomString() {
  let results = '';
  let characters = 'abcdefghijklmnopqrstuvwxyz1234567890';
  let characterLength = characters.length;
  for (let i = 0; i < 6; i++) {
    results += characters.charAt(Math.floor(Math.random() * characterLength));
  }
  return results;
};

function getUsersURLS(userID) {
  let usersURLS = {};
  for (let urlID in urlDatabase) {
    if (urlDatabase[urlID].userID === userID) {
      usersURLS[urlID] = urlDatabase[urlID];
    }
  }
  return usersURLS;
}

function emailExists(email) {
  for (let userID in users) {
    if (users[userID].email === email) {
      let profile = users[userID];
      return profile;
    }
  }
  return false;
}

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: '9xqii7'},
  "9sm5xK": { longURL: "http://www.google.com", userID: '9d0kj3' }
};

const users = { 
  "9xqii7": {
    id: "9xqii7", 
    email: "bigcheddar69@killme.com", 
    password: "pass"
  },
 "9d0kj3": {
    id: "9d0kj3", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

//GET REQUESTS -----------------------------------

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  if(!req.cookies['user_id']) {
    res.redirect('/login')
  } else {
    let usersURLS = getUsersURLS(req.cookies['user_id']);
    let templateVars = { 
      urls: usersURLS, 
      userID: req.cookies['user_id'],
     usersObject: users,
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if(!req.cookies['user_id']) {
    res.redirect('/login')
  } else {
  let templateVars = { 
    userID: req.cookies['user_id'],
    usersObject: users,
  };
  res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.cookies['user_id']) {
    res.redirect('/login')
  } else if (req.cookies['user_id'] !== urlDatabase[req.params.shortURL].userID) {
    res.redirect('https://www.youtube.com/watch?v=otCpCn0l4Wo')
  } else {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]['longURL'],
      userID: req.cookies['user_id'],
      usersObject: users,
    };
  res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = { 
    userID: req.cookies['user_id'],
    usersObject: users,
  };
  res.render("users_new", templateVars);
})

app.get("/login", (req, res) => {
  let templateVars = { 
    userID: req.cookies['user_id'],
    usersObject: users,
  };
  res.render("login", templateVars);
})

//POST REQUESTS ---------------------------------

app.post("/register", (req, res) => {
  const email = req.body.email;
  if (!email || !req.body.password) {
    res.status(400).send("You didn't enter anything bro")
  }
  if (emailExists(email)) {
    res.status(400).send("There is already an account linked to that e-mail address.");
    res.redirect('/register');
  }
  let newID = generateRandomString();
  let newUser = {
    id: newID,
    email: email,
    password: req.body.password,
  };
  users[newID] = newUser
  res.cookie("user_id", newID)
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  console.log('req.body = ', req.body)
  let email = req.body.email;
  let password = req.body.password;
  console.log(`/login ${email} into emailExists`)
  let user = emailExists(email);
  if (!emailExists(email)) {
    res.status(403).send('There is no account under this email, please register an account.')
  }
  if (user.password === password) {
    res.cookie("user_id", user.id);
  } else {
    res.status(403).send('Incorrect Password, try again buddy.')
  }
  console.log(emailExists(email));
  // if (emailExists(email) && )

  res.redirect('/urls');
})

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/urls');
})

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.cookies['user_id']) {
    res.redirect('/login')
  } else {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
  }
})

app.post("/urls/:shortURL", (req, res) => {
  let newLongURL = req.body.newLongURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect('/urls')
})

app.post("/urls", (req, res) => { 
  let newShortUrl = generateRandomString();
  let newEntry = {longURL: req.body.longURL, userID: req.cookies['user_id']}
  urlDatabase[newShortUrl] = newEntry;
  console.log(urlDatabase);
  res.redirect(`/urls/${newShortUrl}`);         
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});