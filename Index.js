'use strict'
 
const express = require('express');
const morgan = require('morgan');
const bodyParser = require("body-parser");
const DBAbstraction = require('./DBAbstraction');
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const db = new DBAbstraction('./software_Data.db');
const mmm = require('mmmagic');
const { constants } = require('buffer');
const magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);
const app = express();
 
app.use(morgan('dev'));
app.use(express.static('public'));  
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// If modifying these scopes, delete token.json.
const SCOPES = ['https://mail.google.com/',
'https://www.googleapis.com/auth/drive.metadata.readonly'];
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

authorize().then(listFiles).catch(console.error);

app.post('/project', async (req, res) => { 
     
    const fName = req.body.fname;
    const lName = req.body.lname;
    const email = req.body.email;
    const cityTown = req.body.cityTown;
    const OrgSite = req.body.OrgSite;
    const pnumber = req.body.pnumber;
    const state = req.body.state;
    const radio = req.body.radio;
    const OrgName = req.body.OrgName;
    const streetAddr = req.body.streetAddr;
    const zip = req.body.zip;
    const helpAvail = req.body.helpAvail;
    const Description = req.body.Description;
    const FileDrop = req.body.FileDrop;
    const depart = req.body.multipleDrop;

    await db.insertCompany(OrgName, streetAddr, cityTown, state, zip, fName, lName, pnumber, email, OrgSite);
    await db.getCompanyID(OrgName, fName, lName)
    .then(companyID => {
        const id = companyID;
        if(id){
            db.insertProject(Description, "Waiting", FileDrop, radio, helpAvail, id); // need to add radio and helpAvail of contact.
            res.json({"result": "success"});
        }
        else{
            res.json({"result": "Failed to find or make company"});
            
        }
    });
});

app.get('/everyproject', async (req, res) => {
	 
   try {
	const allProjects = await db.getAllProjects();
	if(allProjects) {
    	res.json(allProjects);
	} else {
    	res.json({"results": "none"});
	}
} catch (err) {
	res.json({"results": "none"});
}

//First draft of a get function for generating and populating the left-hand table in faculty.html. still unsure of how to call this function from the html file itself, or if im supposed to be doing that in the first place
});

app.get('/allinformation/:description', async (req, res) => {
	try {
    	const projectInfo = await db.getAllInformationByProjectDescription(req.params.description);
    	if(projectInfo) {
        	res.json(projectInfo);
    	} else {
        	res.json({"results": "none"});
    	}
	} catch (err) {
    	res.json({"results": "none"});
	}

  //first draft of a get function for generating a table on the right-hand side of faculty.html with all the information about a project based on what project you clicked from the left-hand table
});
 
app.get('/cs-legend/:name', async (req, res) => {
	try {
    	const legend = await db.getLegendByLastName(req.params.name);
    	if(legend) {
        	res.json(legend);
    	} else {
        	res.json({"results": "none"});
    	}
	} catch (err) {
    	res.json({"results": "none"});
	}
});
 
app.get('/allLegends/:year', async (req, res) => {
	try {
    	const legends = await db.getAllLegendsBornOnOrAfter(Number(req.params.year));
    	if(legends) {
        	res.json(legends);
    	} else {
        	res.json({"results": "none"});
    	}
	} catch (err) {
    	res.json({"results": "none"});
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