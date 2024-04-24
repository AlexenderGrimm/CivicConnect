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
 
	insertProjectDepartment(departmentID, projectID){
		const sql = 'INSERT INTO ProjectDepartment (departmentID, projectID) VALUES (?, ?)';
		return new Promise((resolve, reject) => { 
            this.db.run(sql, [departmentID, projectID], (err) => {                 
                if(err) { 
                    reject(err); 
                } else { 
                    resolve(); 
                } 
            }); 
        }); 
	}

    insertCompany(cname, street, city, state, zip, first, last, phone, email, web) 
    {
        const sql = 'INSERT OR IGNORE INTO Company (name, street, city, state, zip, first, last, phone, email, companyWeb)'
         + ' VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
        return new Promise((resolve, reject) => { 
            this.db.run(sql, [cname, street, city, state, zip, first, last, phone, email, web], (err) => {                 
                if(err) { 
                    reject(err); 
                } else { 
                    resolve(); 
                } 
            }); 

        }); 
    }

	insertDepartment(dname, head)
	{
    	const sql = 'INSERT INTO Department (name, head) VALUES (?, ?, ?);';
    	return new Promise((resolve, reject) => {
        	this.db.run(sql, [dname, head], (err) => {            	 
            	if(err) {
                	reject(err);
            	} else {
                	resolve();
            	}
        	});
    	});
	}

    insertProject(Description, pstatus, file, comp, radio, helpAvail, id, dateTime) 
    {
        
        const sql = 'INSERT OR IGNORE INTO Project (Description, pstatus, file, TimeLine, Date, radio, helpAvail, CompanyID) VALUES (?, ?, ?, ?, ?, ?, ?, ?);';
        
		console.log(dateTime);
        return new Promise((resolve, reject) => { 
            this.db.run(sql, [Description, pstatus, file, comp, dateTime, radio, helpAvail, id], (err) => {                 
                if(err) { 
                    reject(err); 
                } else { 
                    resolve(); 
                } 
            }); 
        });
    }

    getCompanyID(name, fname, lname) {
        const sql = `
            SELECT companyID
            FROM Company
            WHERE name = ? COLLATE NOCASE
            AND first = ? COLLATE NOCASE
            AND last = ? COLLATE NOCASE;
        `;
    
        return new Promise((resolve, reject) => {
            this.db.get(sql, [name, fname, lname], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? row.companyID : null);
                }
            });
        });
    }

    async exportFile(fileId, mType) {
        const {GoogleAuth} = require('google-auth-library');
        const {google} = require('googleapis');
      
        // Get credentials and build service
        // TODO (developer) - Use appropriate auth mechanism for your app
        const auth = new GoogleAuth({
          scopes: 'https://www.googleapis.com/auth/drive',
        });
        const service = google.drive({version: 'v3', auth});
      
        try {
          const result = await service.files.export({
            fileId: fileId,
            mimeType: mType,
          });
          console.log(result.status);
          return result;
        } catch (err) {
          // TODO(developer) - Handle error
          throw err;
        }
    }

    insertUser(first, last, role, email, phone) 
    {
        const sql = 'INSERT INTO User (first, last, role, email, phone) VALUES (?, ?, ?, ?, ?, ?);';
        return new Promise((resolve, reject) => { 
            this.db.run(sql, [first, last, role, email, phone], (err) => {                 
                if(err) { 
                    reject(err); 
                } else { 
                    resolve(); 
                } 
            }); 
        }); 
    }

	getAllProjects()
	{
    	const sql = `
		SELECT Company.name, Company.phone, Project.Description, Project.Date, Project.pstatus, Department.depName, Project.projectID
		FROM Project, Company, Department, ProjectDepartment
		WHERE Project.CompanyID = Company.companyID
		AND Project.projectID = ProjectDepartment.projectID
		AND Department.departmentID = ProjectDepartment.departmentID
        ORDER BY Department.depName
		;`;

    	return new Promise((resolve, reject) => {
        	this.db.all(sql, [], (err, row) => {
            	if(err) {
                	reject(err);
            	} else {
                	resolve(row);
            	}
        	});
    	});
	}

    getAllProjectsSearch(Search)
    {
        const sql = `SELECT Company.name, Company.phone, Project.Description, Project.Date, Project.pstatus, Department.depName, Project.projectID
		FROM Project, Company, Department, ProjectDepartment
		WHERE Project.CompanyID = Company.companyID
		AND Project.projectID = ProjectDepartment.projectID
		AND Department.departmentID = ProjectDepartment.departmentID
        AND (
            Department.depName like ? COLLATE NOCASE
            OR Project.pstatus like ? COLLATE NOCASE
            OR Project.Description like ? COLLATE NOCASE
            OR Company.Name like ? COLLATE NOCASE
            OR Company.first like ? COLLATE NOCASE
        );
        `;
        return new Promise((resolve, reject) => { 
            this.db.all(sql, [Search, Search, Search, Search, Search], (err, row) => {                 
                if(err) { 
                    reject(err); 
                } else { 
                    resolve(row); 
                } 
            }); 
        }); 
    }

	getAllProjectsSortByCompany()
	{
    	const sql = `
		SELECT Company.name, Company.phone, Project.Description, Project.Date, Project.pstatus, Department.depName, Project.projectID
		FROM Project, Company, Department, ProjectDepartment
		WHERE Project.CompanyID = Company.companyID
		AND Project.projectID = ProjectDepartment.projectID
		AND Department.departmentID = ProjectDepartment.departmentID
		ORDER BY Company.name;
		;`;

    	return new Promise((resolve, reject) => {
        	this.db.all(sql, [], (err, row) => {
            	if(err) {
                	reject(err);
            	} else {
                	resolve(row);
            	}
        	});
    	});
	}

    getAllProjectsReverseSortByCompany()
	{
    	const sql = `
		SELECT Company.name, Company.phone, Project.Description, Project.Date, Project.pstatus, Department.depName, Project.projectID
		FROM Project, Company, Department, ProjectDepartment
		WHERE Project.CompanyID = Company.companyID
		AND Project.projectID = ProjectDepartment.projectID
		AND Department.departmentID = ProjectDepartment.departmentID
		ORDER BY Company.name DESC;
		;`;

    	return new Promise((resolve, reject) => {
        	this.db.all(sql, [], (err, row) => {
            	if(err) {
                	reject(err);
            	} else {
                	resolve(row);
            	}
        	});
    	});
	}

	getAllProjectsSortByDate()
	{
    	const sql = `
		SELECT Company.name, Company.phone, Project.Description, Project.Date, Project.pstatus, Department.depName, Project.projectID
		FROM Project, Company, Department, ProjectDepartment
		WHERE Project.CompanyID = Company.companyID
		AND Project.projectID = ProjectDepartment.projectID
		AND Department.departmentID = ProjectDepartment.departmentID
		ORDER BY Project.Date
		;`;

    	return new Promise((resolve, reject) => {
        	this.db.all(sql, [], (err, row) => {
            	if(err) {
                	reject(err);
            	} else {
                	resolve(row);
            	}
        	});
    	});
	}

    getAllProjectsReverseSortByDate()
	{
    	const sql = `
		SELECT Company.name, Company.phone, Project.Description, Project.Date, Project.pstatus, Department.depName, Project.projectID
		FROM Project, Company, Department, ProjectDepartment
		WHERE Project.CompanyID = Company.companyID
		AND Project.projectID = ProjectDepartment.projectID
		AND Department.departmentID = ProjectDepartment.departmentID
		ORDER BY Project.Date DESC
		;`;

    	return new Promise((resolve, reject) => {
        	this.db.all(sql, [], (err, row) => {
            	if(err) {
                	reject(err);
            	} else {
                	resolve(row);
            	}
        	});
    	});
	}

    getAllProjectsSortByStatus()
	{
    	const sql = `
		SELECT Company.name, Company.phone, Project.Description, Project.Date, Project.pstatus, Department.depName, Project.projectID
		FROM Project, Company, Department, ProjectDepartment
		WHERE Project.CompanyID = Company.companyID
		AND Project.projectID = ProjectDepartment.projectID
		AND Department.departmentID = ProjectDepartment.departmentID
		ORDER BY project.pstatus
		;`;

    	return new Promise((resolve, reject) => {
        	this.db.all(sql, [], (err, row) => {
            	if(err) {
                	reject(err);
            	} else {
                	resolve(row);
            	}
        	});
    	});
	}


	getAllProjectsReverseSortByStatus()
	{
    	const sql = `
		SELECT Company.name, Company.phone, Project.Description, Project.Date, Project.pstatus, Department.depName, Project.projectID
		FROM Project, Company, Department, ProjectDepartment
		WHERE Project.CompanyID = Company.companyID
		AND Project.projectID = ProjectDepartment.projectID
		AND Department.departmentID = ProjectDepartment.departmentID
		ORDER BY project.pstatus DESC
		;`;

    	return new Promise((resolve, reject) => {
        	this.db.all(sql, [], (err, row) => {
            	if(err) {
                	reject(err);
            	} else {
                	resolve(row);
            	}
        	});
    	});
	}



	getAllProjectsSortByDepartment()
	{
    	const sql = `
		SELECT Company.name, Company.phone, Project.Description, Project.Date, Project.pstatus, Department.depName, Project.projectID
		FROM Project, Company, Department, ProjectDepartment
		WHERE Project.CompanyID = Company.companyID
		AND Project.projectID = ProjectDepartment.projectID
		AND Department.departmentID = ProjectDepartment.departmentID
		ORDER BY Department.depName
		;`;

    	return new Promise((resolve, reject) => {
        	this.db.all(sql, [], (err, row) => {
            	if(err) {
                	reject(err);
            	} else {
                	resolve(row);
            	}
        	});
    	});	
	}

    getAllProjectsReverseSortByDepartment()
	{
    	const sql = `
		SELECT Company.name, Company.phone, Project.Description, Project.Date, Project.pstatus, Department.depName, Project.projectID
		FROM Project, Company, Department, ProjectDepartment
		WHERE Project.CompanyID = Company.companyID
		AND Project.projectID = ProjectDepartment.projectID
		AND Department.departmentID = ProjectDepartment.departmentID
		ORDER BY Department.depName DESC
		;`;

    	return new Promise((resolve, reject) => {
        	this.db.all(sql, [], (err, row) => {
            	if(err) {
                	reject(err);
            	} else {
                	resolve(row);
            	}
        	});
    	});
	}

    getAllInformationByProjectID(proID)
	{
		if(!Number.isInteger(proID)) { 
            return null; 
        }
		 
    	const sql = `
		SELECT Project.projectID, Project.Description, Project.pstatus, Project.file, Project.TimeLine, Project.Date, Project.radio, Project.helpAvail, Company.name, Company.street, Company.city, Company.state, Company.zip, Company.first, Company.last, Company.phone, Company.email, Company.companyWeb, Department.depName, Department.head, Department.depEmail
		FROM Project, Company, Department, ProjectDepartment
		WHERE Project.CompanyID = Company.companyID 
		AND Project.projectID = ?
		AND Project.projectID = ProjectDepartment.projectID 
		AND Department.departmentID = ProjectDepartment.departmentID
		;`;

    	return new Promise((resolve, reject) => {
        	this.db.all(sql, [proID], (err, row) => {
            	if(err) {
                	reject(err);
            	} else {
                	resolve(row);
            	}
        	});
    	});
	}

	updateProjectStatus(proID)
    {
   	 const sql = `
   	 UPDATE Project
   	 SET pstatus =
   	 CASE
   	 WHEN pstatus = 'Incomplete' THEN 'Complete'
   	 WHEN pstatus = 'Waiting' THEN 'Incomplete'
   	 WHEN pstatus = 'Complete' THEN 'Waiting'
   	 ELSE 'Waiting' END
   	 WHERE projectID = ? COLLATE NOCASE;
   	 `;

    
   	 return new Promise((resolve, reject) => {
   		 this.db.run(sql, [proID], (err) => {            	 
            	if(err) {
                	reject(err);
            	} else {
                	resolve();
            	}
        	});
   	 });

    }
	deleteProject(proID)
    {
   	 const sql = `
   		DELETE FROM ProjectDepartment
		WHERE projectID = ? COLLATE NOCASE;

		DELETE FROM Project
		WHERE projectID = ? COLLATE NOCASE;
   	 `;

   	 return new Promise((resolve, reject) => {
   		 this.db.run(sql, [proID], (err) => {            	 
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
        	SELECT name, street, city, state, zip, ContactFirst, ContactLast, phone, email
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
    getProjectID(description) 
    { 
        const sql = ` 
            SELECT projectID
            FROM Project
            WHERE Description = ? COLLATE NOCASE; 
        `; 
        return new Promise((resolve, reject) => { 
            this.db.get(sql, [description], (err, row) => {                 
                if(err) { 
                    reject(err); 
                } else { 
                    resolve(row ? row.projectID : null); 
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

	getDepartmentEmail(id)
	{
    	const sql = `
		SELECT depEmail
		FROM Department
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