'use strict'

var emailAddresses= [/*1*/"adassow@carthage.edu", /*2*/"nscharnick@carthage.edu", /*3*/"sobrien3@carthage.edu", /*4*/"rbingen@carthage.edu", 
/*5*/"rnagel@carthage.edu",/*6*/"srubinfeld@carthage.edu", /*7*/"wsun@carthage.edu", /*8*/"jmast@carthage.edu", /*9*/"lhuaracha@carthage.edu", 
/*10*/"ljensen@carthage.edu", /*11*/"smitchell@carthage.edu",/*12*/"jtenuta@carthage.edu", /*13*/"fig23_civic_engagement@carthage.edu" , 
/*14*/"cpalmer5@carthage.edu", /*15*/"rmatthews@carthage.edu"]

var USER = 'afischer1@carthage.edu'; // generated ethereal user fig23_civic_engagement@carthage.edu austinf0912@gmail.com
var PASS = 'csrl lbqr uape wlkk';
 
const express = require('express');
const fileUpload = require('express-fileupload')
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cors = require('cors');
const _ = require('lodash');
const DBAbstraction = require('./DBAbstraction');
const fs = require('fs').promises;
const path = require('path');
const nodemailer = require("nodemailer");
const process = require('process');
const db = new DBAbstraction('software_Data.db'); 
const passport = require('passport');
const OneLoginStrategy = require('passport-openidconnect').Strategy;
const session = require('cookie-session');
const { date } = require('assert-plus');
require('dotenv').config();
const router = express.Router();

const app = express(); 
app.set('trust proxy', 1);
//let transporter = nodemailer.createTransport(options[, defaults])
const handlebars = require('express-handlebars').create({defaultLayout: 'main'});
var sortComp = false;
var sortDate = false;
var sortStat = false;
var sortDep = true;

app.use(cors());
app.engine('handlebars', handlebars.engine); 
app.set('view engine', 'handlebars');
app.use(morgan('dev'));
app.use(express.static('public'));  
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure session middleware
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: false,
  maxAge: 1000 * 60 * 15,
  cookie:{
      secure: true
         }
  }));

// Configure Passport.js
passport.use(new OneLoginStrategy({
    issuer: process.env.OIDC_BASE_URI + '/oidc/2',
    clientID: process.env.OIDC_CLIENT_ID,
    clientSecret: process.env.OIDC_CLIENT_SECRET,
    authorizationURL: process.env.OIDC_BASE_URI + '/oidc/2/auth',
    userInfoURL: process.env.OIDC_BASE_URI + '/oidc/2/me',
    tokenURL: process.env.OIDC_BASE_URI + '/oidc/2/token',
    callbackURL: process.env.OIDC_REDIRECT_URI,
    passReqToCallback: true
  }, (req, issuer, userId, profile, accessToken, refreshToken, params, cb) => {
    // Save tokens to session
    req.session.accessToken = accessToken;
    req.session.idToken = params['id_token'];
    return cb(null, profile);
  }));
  
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));
  
  // Initialize Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Middleware to check authentication
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/home');
  }

function addresses(ids){
  var email = "";
  for (var i = 0; i < ids.length; i++) {
    email += emailAddresses[ids[i] - 1];
    if(i < ids.length - 1){
      email+=  ", ";
    }
  }
  return email;
}

async function mailer(bodyParser) {

  const output = `
    <p>You have a new project request</p>
    <h3>Contact deatils</h3>
    <ul>
      <li>Name: ${bodyParser.fname} ${bodyParser.lname}</li>
      <li>Company: ${bodyParser.OrgName}</li>
      <li>Email: ${bodyParser.email}</li>
    </ul>
    <h3>Project description</h3>
    <p>${bodyParser.Description}</p>
  `;

   // create reusable transporter object using the default SMTP transport
   let transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: USER, // generated ethereal user fig23_civic_engagement@carthage.edu austinf0912@gmail.com
        pass: PASS  // generated ethereal password AustinCarolinaRickWenjie2023    dkaw pkvq rxin lwzl
    },
    tls:{
      rejectUnauthorized:false
    }
  });
  var emails = addresses(bodyParser.multipleDrop);

  // setup email data with unicode symbols
  let mailOptions = {
      from: '"Civic Connect mailer" <afischer1@carthage.edu>', // sender address
      to: 'afischer1@carthage.edu, austinf0912@gmail.com', // list of receivers
      subject: 'Civic Connect Request', // Subject line
      html: output // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);   
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

  });
  console.log(mailOptions);
}

/* GET form page. */
app.get('/', function(req, res, next) {
    res.render('form', { layout: false });
});

/* GET home page. */
app.get('/home', function(req, res, next) {
    res.render('index', { title: 'Civic Connect Login' });
  });

// Login route
app.get('/login', passport.authenticate('openidconnect', {
    successReturnToOrRedirect: '/faculty',
    scope: 'profile'
  }));

// Callback route
app.get('/oauth/callback', passport.authenticate('openidconnect', {
    callback: true,
    successReturnToOrRedirect: '/faculty', // Redirect to faculty page after successful login
    failureRedirect: '/home'
  }));


// Destroy both the local session and
// revoke the access_token at OneLogin
app.get('/logout', function(req, res) {
    req.logout(function(err) {
        if(err) {
            // Handle error
            console.error(err);
            return res.status(500).send('Error logging out');
        }
        // Successful logout
        res.redirect('/home'); // Redirect to homepage or wherever you want
    });
});

app.post('/project', async (req, res) => { 
    const fName = req.body.fname;
    const lName = req.body.lname;
    const email = req.body.email;
    const cityTown = req.body.cityTown;
    const OrgSite = req.body.OrgSite;
    const pNumber = req.body.pNumber;
    const state = req.body.state;
    const radio = req.body.radio;
    const OrgName = req.body.OrgName;
    const Comp = req.body.Comp;
    const streetAddr = req.body.streetAddr;
    const zip = req.body.zip;
    const helpAvail = req.body.helpAvail;
    const Description = req.body.Description;
    const depart = req.body.multipleDrop;
  
    try {
      await db.insertCompany(OrgName, streetAddr, cityTown, state, zip, fName, lName, pNumber, email, OrgSite);
      const companyID = await db.getCompanyID(OrgName, fName, lName);
      if (!companyID) {
        return res.json({"result": "Failed to find or make company"});
      }
  
      var currentDate = new Date(); 
      var dateTime = currentDate.getFullYear() + " / " 
          + String(Number(currentDate.getMonth())+1) + " / "
          + currentDate.getDate()  + " @ "  
          + currentDate.getHours() + ":"  
          + currentDate.getMinutes() + ":" 
          + currentDate.getSeconds();
      await db.insertProject(Description, "Waiting", Comp, radio, helpAvail, companyID, dateTime);
  
      const projectID = await db.getProjectID(Description);
      if (!projectID) {
        return res.json({"result": "Failed to find or make Project"});
      }
  
      for (var i = 0; i < depart.length; i++) {
        await db.insertProjectDepartment(depart[i], projectID);
      }
  
      mailer(req.body);
  
      res.send('Thank you for your project submission.');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

app.get('/faculty', ensureAuthenticated, async (req, res) => {
	 
   try {
	    const allProjects = await db.getAllProjectsReverseSortByDate();
        sortDate = true;
	    if(allProjects) {
        	res.render('leftHandTable', {projects: allProjects});
	    } else {
        	res.json({"results": "none"});
	    }
    } catch (err) {
	    res.json({"results": err.message});
    }
});

app.post('/faculty/Search',ensureAuthenticated, async (req, res) => {
    try {
        if(req.body.Search == ""){
            res.redirect('/faculty')
        }
        const allProjects = await db.getAllProjectsSearch("%" + req.body.Search + "%");
        res.render('leftHandTable', {projects: allProjects});        
    } catch (err) {
        res.json({"results": err.message});
    }

//First draft of a get function for generating and populating the left-hand table in faculty.html. still unsure of how to call this function from the html file itself, or if im supposed to be doing that in the first place
});

app.get('/faculty/company', ensureAuthenticated, async (req, res) => {
	 
  try {
    var allProjects;
    if(sortComp){
        allProjects = await db.getAllProjectsReverseSortByCompany();
        sortComp = false;
    }
    else{
        allProjects = await db.getAllProjectsSortByCompany();
        sortComp = true;
        sortDate = false;
        sortStat = false;
        sortDep = false;
    }
 if(allProjects) {
     res.render('leftHandTable', {projects: allProjects});
 } else {
     res.json({"results": "none"});
 }
} catch (err) {
 res.json({"results": "error"});
}

//First draft of a get function for generating and populating the left-hand table in faculty.html. still unsure of how to call this function from the html file itself, or if im supposed to be doing that in the first place
});

app.get('/faculty/date', ensureAuthenticated, async (req, res) => {
	 
  try {
    var allProjects;
    if(!sortDate){
        allProjects = await db.getAllProjectsReverseSortByDate();
        sortDate = true;
    }
    else{
        allProjects = await db.getAllProjectsSortByDate();
        sortComp = false;
        sortDate = false;
        sortStat = false;
        sortDep = false;
    }
if(allProjects) {
     res.render('leftHandTable', {projects: allProjects});
 } else {
     res.json({"results": "none"});
 }
} catch (err) {
 res.json({"results": "error"});
}

//First draft of a get function for generating and populating the left-hand table in faculty.html. still unsure of how to call this function from the html file itself, or if im supposed to be doing that in the first place
});

app.get('/faculty/status', ensureAuthenticated, async (req, res) => {
	 
  try {
    var allProjects;
    if(sortStat){
        allProjects = await db.getAllProjectsReverseSortByStatus();
        sortStat = false;
    }
    else{
        allProjects = await db.getAllProjectsSortByStatus();
        sortComp = false;
        sortDate = false;
        sortStat = true;
        sortDep = false;
    }
 if(allProjects) {
     res.render('leftHandTable', {projects: allProjects});
 } else {
     res.json({"results": "none"});
 }
} catch (err) {
 res.json({"results": "error"});
}

//First draft of a get function for generating and populating the left-hand table in faculty.html. still unsure of how to call this function from the html file itself, or if im supposed to be doing that in the first place
});

app.get('/faculty/department', ensureAuthenticated, async (req, res) => {
	 
  try {
    var allProjects;
    if(sortDep){
        allProjects = await db.getAllProjectsReverseSortByDepartment();
        sortDep = false;
    }
    else{
        allProjects = await db.getAllProjectsSortByDepartment();
        sortComp = false;
        sortDate = false;
        sortStat = false;
        sortDep = true;
    }
 if(allProjects) {
     res.render('leftHandTable', {projects: allProjects});
 } else {
     res.json({"results": "none"});
 }
} catch (err) {
 res.json({"results": "error"});
}

//First draft of a get function for generating and populating the left-hand table in faculty.html. still unsure of how to call this function from the html file itself, or if im supposed to be doing that in the first place
});

app.get('/allinformation/:projectid', ensureAuthenticated, async (req, res) => {
	try {
        
    	const projectInfo = await db.getAllInformationByProjectID(Number(req.params.projectid));
    	if(projectInfo) {
        res.render('allInfoTable', {information: projectInfo});
    	} else {
        	res.json({"results": "none"});
    	}
	} catch (err) {
    	res.json({"results": "error"});
	}

  //first draft of a get function for generating a table on the right-hand side of faculty.html with all the information about a project based on what project you clicked from the left-hand table
});

app.get('/allinformation/statusupdate/:projectid', ensureAuthenticated, async (req, res) => {
  try {
	await db.updateProjectStatus(Number(req.params.projectid));

  } catch (err) {
	res.json({"results": "error"});
  }
  res.redirect('/allinformation/' + req.params.projectid);
});

app.get('/allinformation/delete/:projectid', ensureAuthenticated, async(req, res) => {
  try {
    
      // Use projectIdToDelete to delete the project from your database
      await db.deleteProject(Number(req.params.projectid));
      await db.deleteUnusedCompany();
      
      // Redirect to the desired page after successful deletion
      res.redirect('/faculty'); // Adjust the redirect URL as needed
  } catch (error) {
      // Handle any errors that occur during deletion
      console.error('Error deleting project:', error);
      res.status(500).send('Internal Server Error'); // Respond with an appropriate error message
  }
});

app.get('/allinformation/deleteDep/:projectid/:depName', ensureAuthenticated, async(req, res) => {
  try {

    var depID = db.getDepartmentID(req.params.depName);

    if(depID){
      // Use projectIdToDelete to delete the project from your database
      await db.deleteProjectDep(Number(req.params.projectid), depID);
      // Redirect to the desired page after successful deletion
      res.redirect(`/allinformation/${req.params.projectid}`); // Adjust the redirect URL as needed
    }
      
  } catch (error) {
      // Handle any errors that occur during deletion
      console.error('Error deleting project:', error);
      res.status(500).send('Internal Server Error'); // Respond with an appropriate error message
  }
});
 
app.use((req, res) => {
	res.status(404).send(`<h2>Uh Oh!</h2><p>Sorry ${req.url} cannot be found here</p>`);
});
 
db.init()
	.then(() => {
    	// Start the server
        const port = process.env.PORT  || 53140;
        app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        });
	})
	.catch(err => {
    	console.log('Problem setting up the database');
    	console.log(err);
	});
