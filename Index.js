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
 
const app = express(); 
 
app.use(morgan('dev')); 
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json()); 

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
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
async function listLabels(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  const res = await gmail.users.labels.list({
    userId: 'me',
  });
  const labels = res.data.labels;
  if (!labels || labels.length === 0) {
    console.log('No labels found.');
    return;
  }
  console.log('Labels:');
  labels.forEach((label) => {
    console.log(`- ${label.name}`);
  });
}

authorize().then(listLabels).catch(console.error);

app.post('/project', async (req, res) => { 
     
    const fName = req.body.fName; 
    const lName = req.body.lName; 
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

    await db.insertCompany(OrgName, streetAddr, cityTown, state, zip, fName, lName, pnumber, email, web);
    await db.insertProject(Description, "Waiting", FileDrop);
 
    res.json({"result": "success"}); 
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