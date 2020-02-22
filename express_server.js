const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { getUserByEmail } = require('./helpers');


app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

app.use(cookieSession({
  name: 'session',
  keys: ['secret'],
}));

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


const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: '9xqii7'},
  "9sm5xK": { longURL: "http://www.google.com", userID: '9d0kj3' }
};

const users = {}

//GET REQUESTS -----------------------------------

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  let user = users[req.session.user_id];
  if(!user) {
    res.redirect('/login')
  } else {
    let usersURLS = getUsersURLS(user.id);
    let templateVars = { 
      urls: usersURLS, 
      user: user,
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  let user = users[req.session.user_id];
  if(!req.session.user_id) {
    res.redirect('/login')
  } else {
  let templateVars = { 
    user: user,
  };
  res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let user = users[req.session.user_id];
  if (!req.session.user_id) {
    res.redirect('/login')
  } else if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    res.redirect('https://www.youtube.com/watch?v=otCpCn0l4Wo')
  } else {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]['longURL'],
      user: user,
    };
  res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let user = users[req.session.user_id];
  let templateVars = { 
    user: user,
  };
  res.render("users_new", templateVars);
})

app.get("/login", (req, res) => {
  let user = users[req.session.user_id];
  let templateVars = { 
    user: user,
  };
  res.render("login", templateVars);
})

//POST REQUESTS ---------------------------------

app.post("/register", (req, res) => {
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10)
  const email = req.body.email;
  if (!email || !req.body.password) {
    res.status(400).send("You didn't enter anything bro")
  }
  if (getUserByEmail(email, users)) {
    res.status(400).send("There is already an account linked to that e-mail address.");
    res.redirect('/register');
  }
  let newID = generateRandomString();
  let newUser = {
    id: newID,
    email: email,
    password: hashedPassword,
  };
  users[newID] = newUser
  // res.cookie("user_id", newID);
  req.session.user_id = newID
  console.log('new users object', newUser);
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  console.log('req.body = ', req.body)
  let email = req.body.email;
  let password = req.body.password;
  let user = getUserByEmail(email, users);
  if (!getUserByEmail(email, users)) {
    res.status(403).send('There is no account under this email, please register an account.')
  }
  if (bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id;
  } else {
    res.status(403).send('Incorrect Password, try again buddy.')
  }
  res.redirect('/urls');
})

app.post("/logout", (req, res) => {
  req.session = null
  res.redirect('/urls');
})

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login')
  } 
  else if (urlDatabase[req.params.shortURL]['userID'] !== req.session.user_id) {
    res.status(401).send("You can't delete this, it isn't yours to delete")
  } 
  else {
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
  let newEntry = {longURL: req.body.longURL, userID: req.session.user_id}
  urlDatabase[newShortUrl] = newEntry;
  console.log(urlDatabase);
  res.redirect(`/urls/${newShortUrl}`);         
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});