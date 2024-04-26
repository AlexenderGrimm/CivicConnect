'use strict'
 
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
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const db = new DBAbstraction('./software_Data.db'); 
const app = express(); 
//let transporter = nodemailer.createTransport(options[, defaults])
const handlebars = require('express-handlebars').create({defaultLayout: 'main'});
var sortComp = false;
var sortDate = false;
var sortStat = false;
var sortDep = true;

var USER = 'afischer1@carthage.edu'; // generated ethereal user fig23_civic_engagement@carthage.edu austinf0912@gmail.com
var PASS = 'csrl lbqr uape wlkk';

app.use(cors());
app.use(fileUpload({
    createParentPath: true
}));
app.engine('handlebars', handlebars.engine); 
app.set('view engine', 'handlebars');
app.use(morgan('dev'));
app.use(express.static('public'));  
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// If modifying these scopes, delete token.json.
const SCOPES = ['https://mail.google.com/',
'https://www.googleapis.com/auth/drive.metadata',
'https://www.googleapis.com/auth/gmail.send'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'client_secret_credentials.json');

process.on('uncaughtException', function (err) {
  console.log(err);
}); 


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
    <br></br>
    <p>${bodyParser.FileDrop}</p>
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
  console.log(req.body);
  await db.insertCompany(OrgName, streetAddr, cityTown, state, zip, fName, lName, pNumber, email, OrgSite);
  await db.getCompanyID(OrgName, fName, lName)
  .then(companyID => {
    const id = companyID;
    if(id){
      db.insertProject(Description, "Waiting", FileDrop == "" ? "Nothing" : FileDrop, Comp, radio, helpAvail, id);
    }
    else{
      res.json({"result": "Failed to find or make company"});
    }
  });
  await db.getProjectID(Description)
  .then(projectID => {
    const id = projectID;
    if(id){
      for (var i = 0; i < depart.length; i++) {
        db.insertProjectDepartment(depart[i], id);
      }
    }
    else{
      res.json({"result": "Failed to find or make Project"});
      exit();
    }
  });

  mailer(req.body);

  res.send('Thank you for your project submission.');
});

app.get('/faculty', async (req, res) => {
	 
   try {
	    const allProjects = await db.getAllProjects();
	    if(allProjects) {
        	res.render('leftHandTable', {projects: allProjects});
	    } else {
        	res.json({"results": "none"});
	    }
    } catch (err) {
	    res.json({"results": err.message});
    }
});

app.post('/faculty/Search', async (req, res) => {
    try {
        if(req.body.Search == ""){
            res.redirect('http://localhost:53140/faculty')
        }
        const allProjects = await db.getAllProjectsSearch("%" + req.body.Search + "%");
        res.render('leftHandTable', {projects: allProjects});        
    } catch (err) {
        res.json({"results": err.message});
    }

//First draft of a get function for generating and populating the left-hand table in faculty.html. still unsure of how to call this function from the html file itself, or if im supposed to be doing that in the first place
});

app.get('/faculty/company', async (req, res) => {
	 
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

app.get('/faculty/date', async (req, res) => {
	 
  try {
    var allProjects;
    if(sortDate){
        allProjects = await db.getAllProjectsReverseSortByDate();
        sortDate = false;
    }
    else{
        allProjects = await db.getAllProjectsSortByDate();
        sortComp = false;
        sortDate = true;
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

app.get('/faculty/status', async (req, res) => {
	 
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

app.get('/faculty/department', async (req, res) => {
	 
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

app.get('/allinformation/:projectid', async (req, res) => {
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

app.get('/allinformation/statusupdate/:projectid', async (req, res) => {
  try {
	await db.updateProjectStatus(Number(req.params.projectid));

  } catch (err) {
	res.json({"results": "error"});
  }
  res.redirect('/allinformation/' + req.params.projectid);
});

app.post('/allinformation/delete', async (req, res) => {
  const projectIdToDelete = req.body.projectIDToDelete; // Assuming projectIDToDelete is a string
  console.log(projectIdToDelete);
  try {
    
      // Use projectIdToDelete to delete the project from your database
      await db.deleteProject(Number(projectIdToDelete));
      
      // Redirect to the desired page after successful deletion
      res.redirect('/faculty'); // Adjust the redirect URL as needed
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
    	app.listen(53140, () => console.log('The server is up and running...'));
	})
	.catch(err => {
    	console.log('Problem setting up the database');
    	console.log(err);
	});