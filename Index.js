'use strict' 
 
const express = require('express'); 
const morgan = require('morgan'); 
const bodyParser = require("body-parser"); 
const DBAbstraction = require('./DBAbstraction'); 
 
const db = new DBAbstraction('./ProjectSub.sqlite'); 
 
const app = express(); 
 
app.use(morgan('dev')); 
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json()); 
 
app.post('/legends', async (req, res) => { 
     
    const firstName = req.body.firstName; 
    const lastName = req.body.lastName; 
    const birthDate = req.body.birthDate; 
 
    await db.insertLegend(firstName, lastName, birthDate); 
 
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