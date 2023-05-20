//contains all of the functionality for analyzing MIME types, uploading and downloading files, and sending queries to find certain files



class GasPeddle { 
    constructor(fileName) { 
        this.fileName = fileName; 
    } 
    init() { 
        return new Promise((resolve, reject) => { 
            this.db = new sqlite3.Database(this.fileName, (err) => { 
                if(err) { 
                    reject(err); 
                } else { 
                    resolve(); 
                } 
            }); 
        });
    } 













































}