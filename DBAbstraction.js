const sqlite3 = require('sqlite3'); 
 
class DBAbstraction { 
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
 

    insertCompany(id, cname, street, city, state, zip, first, last, phone, email) 
    {
        const sql = 'INSERT INTO Company (companyID, name, street, city, state, zip, rfirst, rlast, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
        return new Promise((resolve, reject) => { 
            this.db.run(sql, [id, cname, street, city, state, zip, first, last, phone, email], (err) => {                 
                if(err) { 
                    reject(err); 
                } else { 
                    resolve(); 
                } 
            }); 
        }); 
    }

    insertDepartment(id, dname, head)
    {
        const sql = 'INSERT INTO Department (departmentID, name, head) VALUES (?, ?, ?);';
        return new Promise((resolve, reject) => { 
            this.db.run(sql, [id, dname, head], (err) => {                 
                if(err) { 
                    reject(err); 
                } else { 
                    resolve(); 
                } 
            }); 
        }); 
    }

    insertProject(id, pname, pstatus, file) 
    {
        const sql = 'INSERT INTO Project (projectID, name, pstatus, file) VALUES (?, ?, ?, ?);';
        return new Promise((resolve, reject) => { 
            this.db.run(sql, [id, pname, pstatus, file], (err) => {                 
                if(err) { 
                    reject(err); 
                } else { 
                    resolve(); 
                } 
            }); 
        }); 
    }

    insertUser(id, first, last, role, email, phone) 
    {
        const sql = 'INSERT INTO User (userID, first, last, role, email, phone) VALUES (?, ?, ?, ?, ?, ?);';
        return new Promise((resolve, reject) => { 
            this.db.run(sql, [id, first, last, role, email, phone], (err) => {                 
                if(err) { 
                    reject(err); 
                } else { 
                    resolve(); 
                } 
            }); 
        }); 
    }

    getCompanyByName(cname) 
    { 
        const sql = ` 
            SELECT name, street, city, state, zip, rfirst, rlast, phone, email 
            FROM Company
            WHERE name = ? COLLATE NOCASE; 
        `; 
        return new Promise((resolve, reject) => { 
            this.db.get(sql, [cname], (err, row) => {                 
                if(err) { 
                    reject(err); 
                } else { 
                    resolve(row); 
                } 
            }); 
        }); 
    } 

    getCompanyByCity(city) 
    { 
        const sql = ` 
            SELECT name, street, city, state, zip, rfirst, rlast, phone, email 
            FROM Company
            WHERE city = ? COLLATE NOCASE; 
        `; 
        return new Promise((resolve, reject) => { 
            this.db.get(sql, [city], (err, row) => {                 
                if(err) { 
                    reject(err); 
                } else { 
                    resolve(row); 
                } 
            }); 
        }); 
    } 

    getUserByLastName(last) 
    { 
        const sql = ` 
            SELECT first, last, role, email, phone
            FROM User
            WHERE last = ? COLLATE NOCASE; 
        `; 
        return new Promise((resolve, reject) => { 
            this.db.get(sql, [last], (err, row) => {                 
                if(err) { 
                    reject(err); 
                } else { 
                    resolve(row); 
                } 
            }); 
        }); 
    } 

    getCompanyByID(id) 
    { 
        const sql = ` 
            SELECT name, street, city, state, zip, rfirst, rlast, phone, email 
            FROM Company
            WHERE companyID = ? COLLATE NOCASE; 
        `; 
        return new Promise((resolve, reject) => { 
            this.db.get(sql, [id], (err, row) => {                 
                if(err) { 
                    reject(err); 
                } else { 
                    resolve(row); 
                } 
            }); 
        }); 
    } 

    getUserByid(id) 
    { 
        const sql = ` 
            SELECT first, last, role, email, phone
            FROM User
            WHERE userID = ? COLLATE NOCASE; 
        `; 
        return new Promise((resolve, reject) => { 
            this.db.get(sql, [id], (err, row) => {                 
                if(err) { 
                    reject(err); 
                } else { 
                    resolve(row); 
                } 
            }); 
        }); 
    } 

    getProjectCompanyID(id) 
    { 
        const sql = ` 
            SELECT companyID
            FROM ProjectInfo
            WHERE projectID = ? COLLATE NOCASE; 
        `; 
        return new Promise((resolve, reject) => { 
            this.db.get(sql, [id], (err, row) => {                 
                if(err) { 
                    reject(err); 
                } else { 
                    resolve(row); 
                } 
            }); 
        }); 
    } 

    getCompanyProjectID(id) 
    { 
        const sql = ` 
            SELECT projectID
            FROM ProjectInfo
            WHERE companyID = ? COLLATE NOCASE; 
        `; 
        return new Promise((resolve, reject) => { 
            this.db.get(sql, [id], (err, row) => {                 
                if(err) { 
                    reject(err); 
                } else { 
                    resolve(row); 
                } 
            }); 
        }); 
    } 

    getProjectDepartmentID(id)
    {
        const sql = `
            SELECT projectID
            FROM ProjectDepartment
            WHERE departmentID = ? COLLATE NOCASE;
        `;
        return new Promise((resolve, reject) => {
            this.db.get(sql, [id], (err, row) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }
    getDepartmentProjectID(id)
    {
        const sql = `
            SELECT departmentID
            FROM ProjectDepartment
            WHERE projectID = ? COLLATE NOCASE;
        `;
        return new Promise((resolve, reject) => {
            this.db.get(sql, [id], (err, row) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    getDepartmentAssociationDID(id)
    {
        const sql = `
            SELECT departmentID
            FROM DepartmentAssociation
            WHERE userID = ? COLLATE NOCASE;
        `;
        return new Promise((resolve, reject) => {
            this.db.get(sql, [id], (err, row) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    getDepartmentAssociationUID(id)
    {
        const sql = `
            SELECT userID
            FROM DepartmentAssociation
            WHERE departmentID = ? COLLATE NOCASE;
        `;
        return new Promise((resolve, reject) => {
            this.db.get(sql, [id], (err, row) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    getUserProjectUID(id)
    {
        const sql = `
            SELECT userID
            FROM UserProject
            WHERE projectID = ? COLLATE NOCASE;
        `;
        return new Promise((resolve, reject) => {
            this.db.get(sql, [id], (err, row) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    getUserProjectPID(id)
    {
        const sql = `
            SELECT projectID
            FROM UserProject
            WHERE userID = ? COLLATE NOCASE;
        `;
        return new Promise((resolve, reject) => {
            this.db.get(sql, [id], (err, row) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }
}
module.exports = DBAbstraction;