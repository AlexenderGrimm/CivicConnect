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


app.use(cors());
app.use(fileUpload({
    createParentPath: true
}));
app.engine('handlebars', handlebars.engine); 
app.set('view engine', 'handlebars');
app.use(morgan('dev'));
app.use(express.static('public'));  
app.use(bodyParser.urlencoded({ extended: true }));
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

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
	const content = await fs.readFile(TOKEN_PATH);
	const credentials = JSON.parse(content);
	return google.auth.fromJSON(credentials);
  } catch (err) {
	return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
	type: 'authorized_user',
	client_id: key.client_id,
	client_secret: key.client_secret,
	refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
	return client;
  }
  client = await authenticate({
	scopes: SCOPES,
	keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
	await saveCredentials(client);
  }
  return client;
}

async function mailer() {
  
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "fig23_civic_engagement@carthage.edu", // generated ethereal user
      pass: "AustinCarolinaRickWenjie2023", // generated ethereal password
    },
  });

  let info = await transporter.sendMail({
    from: '"civic_engagement" <fig23_civic_engagement@carthage.edu>', // sender address
    to: "fig23_civic_engagement@carthage.edu, Afischer1@carthage.edu", // list of receivers
    subject: "Hello", // Subject line
    text: "I hope this message gets delivered!", // plain text body
  }, (err, info) => {
    //console.log(info.envelope);
    //console.log(info.messageId);
  });

  //console.log("Message sent: %s", info.messageId);

}



/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listFiles(authClient) {
  const drive = google.drive({version: 'v3', auth: authClient});
  const res = await drive.files.list({
	pageSize: 10,
	fields: 'nextPageToken, files(id, name)',
  });
  const files = res.data.files;
  if (files.length === 0) {
	console.log('No files found.');
	return;
  }

  console.log('Files:');
  files.map((file) => {
	console.log(`${file.name} (${file.id})`);
  });
}

//mailer().catch(console.error);
authorize().then(listFiles).catch(console.error);


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
  const FileDrop = req.body.FileDrop;
  const depart = req.body.multipleDrop;
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

  mailer();

  res.json({"result": "success"});
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
	res.json({"results": "error"});
}

//First draft of a get function for generating and populating the left-hand table in faculty.html. still unsure of how to call this function from the html file itself, or if im supposed to be doing that in the first place
});

app.get('/faculty/company', async (req, res) => {
	 
  try {
 const allProjects = await db.getAllProjectsSortByCompany();
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
 const allProjects = await db.getAllProjectsSortByDate();
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
 const allProjects = await db.getAllProjectsSortByStatus();
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
 const allProjects = await db.getAllProjectsSortByDepartment();
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

app.get('/allinformation/statusupdate/:projectid/', async (req, res) => {
  try {
	await db.updateProjectStatus(req.params.projectid);

  } catch (err) {
	res.json({"results": "error"});
  }
  res.redirect('/allinformation/' + req.params.projectid);
  //res.json({"results": "success!"});
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