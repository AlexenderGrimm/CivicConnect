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
 

	insertCompany(cname, street, city, state, zip, first, last, phone, email, web)
	{
    	const sql = 'INSERT INTO Company (name, street, city, state, zip, ContactFirst, ContactLast, phone, email, companyWeb) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
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

	insertProject(Description, pstatus, file)
	{
    	const sql = 'INSERT INTO Project (Description, pstatus, file) VALUES (?, ?, ?);';
    	return new Promise((resolve, reject) => {
        	this.db.run(sql, [Description, pstatus, file], (err) => {            	 
            	if(err) {
                	reject(err);
            	} else {
                	resolve();
            	}
        	});
    	});
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
        	SELECT Company.name, Company.phone, Project.Description, Department.name
        	FROM Project, Company, Department
        	WHERE Project.projectID = Company.companyID AND Project.projectID = Department.departmentID;
    	`;

    	return new Promise((resolve, reject) => {
        	this.db.all(sql, (err) => {
            	if(err) {
                	reject(err);
            	} else {
                	resolve();
            	}
        	});
    	});

    	//rewrite based on how Austin plans to restructure the Database
	}

    getAllInformationByProjectDescription(descrip)
	{
    	const sql = `
        	SELECT Project.Description, Project.pstatus, Project.file, Department.name, Department.head, Company.name, Company.street, Company.city, Company.state, Company.zip, Company.first, Company.last, Company.phone, Company.email, Company.companyWeb, Company.ContactFirst, Company.ContactLast
        	FROM Project, Company, Department
        	WHERE Project.projectID = Company.companyID AND Project.projectID = Department.departmentID AND Project.Description = ? COLLATE NOCASE;
    	`;

    	return new Promise((resolve, reject) => {
        	this.db.get(sql, [descrip], (err, row) => {
            	if(err) {
                	reject(err);
            	} else {
                	resolve(row);
            	}
        	});
    	});

    	//rewrite based on how much information Austin wants the right-hand generated tables to contain
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