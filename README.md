# Med-aid

## Purpose and vision
Have you ever had to keep a detailed log of your family's medical history? To go, and narrate to your child's pediatrician all the medication,fever temperatures and other symptoms that you have kept track of in the last 48 hours? And what if there are two sick children to take care of at the same time?  
Or as a diabetic, needed to keep track of your blood sugar levels and medication dosage?

It gets confusing if you memorize them, or you loose track of where, in all the commotion, you left your notepad with these details.

## Solution
My solution is a RESTful app that uses basic CRUD operations to achieve some sanity around this. 
It is a start to solve this by providing a place to 
* add in your patients with their doctor and doctor's contact information. 
* for each patient, keep a log of symptoms and medication.


## How do you sign in/sign up?
* To set up an account, sign up through the homepage.
* To check it out without creating an account, sign in as a guest user using
>> __Username__ demo, __Password__ demo


## Using the App
* Add a patient with doctor's name and contact information using the form on the top of the page you enter after signing in. 
This adds a row with your input to the table below the form, see below.
![patientadded](https://github.com/roshnikutty/med-aid/blob/master/public/images/added_patient.png)


* Add med. record: For each patient, you can add a record using the 'Add record' button. This opens a form on the same row prompting you to add in Date, Time (as a string), Symptoms and Medication. The first two here are mandatory fields.
![addrecordform](https://github.com/roshnikutty/med-aid/blob/master/public/images/add_med_record_form.png)

>>A row with this data gets added in:
![rowadded](https://github.com/roshnikutty/med-aid/blob/master/public/images/added_record.png)

>>Here's a view with mutiple records:
![multiplerecords](https://github.com/roshnikutty/med-aid/blob/master/public/images/multiple%20records.png)

* Retrieve data: Click on the patient row to see a list of the patient's medical log.


* Delete a record: Click the 'Delete record' button to take out that row of data you no longer wish to retain. After deleting, clicking on that patient's row will no longer bring up the record you deleted.


* Update a patient: shows a form with inputs for Patient name, doctor and doctor's contact info. All are mandatory fields.
![updatebutton](https://github.com/roshnikutty/med-aid/blob/master/public/images/update_patient_hover.png)

>>Form to add in updated data
![updatepatientform](https://github.com/roshnikutty/med-aid/blob/master/public/images/update_patient_form.png)


* Delete a patient: Clicking 'Delete patient' will take out the patient's entry. You will no longer see that patient's row after the page is refreshed.

<h2>Technology</h2>
<h3>Front End</h3>
<ul>
  <li>HTML5</li>
  <li>CSS3</li>
  <li>JavaScript</li>
  <li>jQuery</li>
</ul>
<h3>Back End</h3>
<ul>
  <li>Node.js + Express.js (web server)</li>
  <li>MongoDB (database)</li>
  <li>Mocha + Chai (testing)</li>
  <li>Continuous integration and deployment with Travis CI - View the <a href = "https://travis-ci.org/roshnikutty/med-aid">Travis CI build status for this app</a>.</li>

</ul>
<h3>Responsive</h3>
<ul>
  <li>Styling the app is a work in progress, but it has basic responsive features enabled to view on all screen sizes.</li>
</ul>
<h3>Security</h3>
<ul>
  <li>User passwords are encrypted using bcrypt.js.</li>
  <li>
  JWT (<a href = "https://www.npmjs.com/package/passport-jwt">JSON Web Token</a>) is the Passport strategy I used to authenticate and provide access to authorized users.</li>
</ul>





## Steps to run locally
### Install
```
>   git clone https://github.com/roshnikutty/med-aid.git
>   cd med-aid
>   npm install
```
### Launch
```
>   npm start
```
Then open [`localhost:8000`](http://localhost:8000) in a browser.

### Test
```
>   npm run test
```