1.0 Use Case: Secure Login
Actors: Faculty
Overview: Actor uses password to verify their identity.

Typical Course of Events
1. Page prompts for username and password.
2. User enters their username and password and hits enter/login.
3. System verifies that the username and password are correct.

Alternative Courses
Step 3: User and/or password are not correct.
1. Displays error.
2. Go back to step 1.




2.0 Use Case: Project inspect
Actors: Faculty
Overview: Actor selects a project they want more information about

Typical Course of events
1. Page displays all projects.
2. User left clicks on project description.
3. system redirects the user to all project information.


2.1 Use Case: Project Update Status
Actors: Faculty
Overview: Actor changes project status between WAITING, INPROGRESS, and COMPLETE

Typical course of events
1. Page displays the project information.
2. User selects between project status.
3. System updats database with updated status.


2.2 Use Case: Project Update Goals
Actors: Faculty
Overview: Actor Selects what Aspire goals the project

Typical course of events
1. Page displays the project information.
2. User selects Aspire Goals that fit with the completed project
3. System updates database with selected goals.




3.0 Use Case: Filter
Actor: Faculty
Overview: Actor selects categoty to filter all projects by.

Typical Course of events
1. Page displays all projects.
2. user selects category of information
3. page updates project ordering to match selected categories order (alphabetical, numerical order).

Alterative courses
step 2 is repeated
1. page updates project ordering to match selected categories order (reverse alphabetical, reverse numerical order).


3.1 Use Case: Filter Search
Actor: Faculty
Overview: User types something to search for in a given feild.

Typical Course of Events
1. Page displays all projects.
2. user inputs text into search box.
3. System updates project list to only contain projects who's organization, contact name, or project description contains the text string.
