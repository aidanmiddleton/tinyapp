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

function emailExists(email) {
  for (let userID in users) {
    if (users[userID].email === email) {
      console.log(`if EmailEists: ${users[userID].email} === ${email}`)
      let profile = users[userID];
      return profile;
    }
  }
  return false;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  
  let templateVars = { 
    urls: urlDatabase, 
    userID: req.cookies['user_id'],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    userID: req.cookies['user_id'],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  res.render("users_new")
})

app.get("/login", (req, res) => {
  res.render("login")
})

//POST REQUESTS ---------------------------------

app.post("/register", (req, res) => {
  console.log(req.body);
  const email = req.body.email;
  if (!email || !req.body.password) {
    res.status(400).send("You didn't enter anything, moron")
  }
  if (emailExists(email)) {
    res.status(400).send("There is already an account linked to that e-mail address.");
    res.redirect('/register');
  }
  console.log(users);
  let newID = generateRandomString();
  let newUser = {
    id: newID,
    email: email,
    password: req.body.password,
  };
  users[newID] = newUser
  res.cookie("user_id", newID)
  console.log(users);
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
  }
  console.log(emailExists(email));
  // if (emailExists(email) && )

  res.redirect('/urls');
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
})

app.post("/urls/:shortURL", (req, res) => {
  console.log('request.params', req.params)
  console.log(req.body, req.body.newLongURL)
  let newLongURL = req.body.newLongURL;
  console.log('new long url ', newLongURL);
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect('/urls')
})

app.post("/urls", (req, res) => {
  console.log("app.post req.body", req.body);  
  let newShortUrl = generateRandomString();
  urlDatabase[newShortUrl] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${newShortUrl}`);         
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});