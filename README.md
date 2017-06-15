# Med-aid

## Purpose and vision
Have you ever had to keep a detailed log of your family's medical history? To go and narrate to your child's pediatrician all the medication, fever temperatures and other symptoms that you have kept track of in the last 48 hours? And what if there are two sick children to take care of at the same time?  
Or as a diabetic needed to keep track of your blood sugar levels, and medication dosage?

It gets confusing if you memorize them, or you loose track of where in all the commotion you left your notepad with these details.

## Solution
My app here is a start to solve this by providing a place to 
* add in your patients with their doctor and doctor's contact information. 
* for each patient, keep a log of symptoms and medication.

## How do you sign in/sign up?
* If you don't have an account, sign up through the homepage.
* To check it out without creating an account, sign in as a guest user.

## Using the App
* Add a patient with doctor's name and contact information using the form on the top of the page you enter after signing in. 
This adds a row with your input to the table below the form, see below.
![patientadded](https://github.com/roshnikutty/med-aid/blob/master/public/images/added_patient.png)


* Add med. record: For each patient, you can add a record using the 'Add record' button. This opens a form on the same row prompting you to add in Date, Time (as a string), Symptoms and Medication. The first two here are mandatory fields.
![addrecordform](https://github.com/roshnikutty/med-aid/blob/master/public/images/add_med_record_form.png)

A row with this data gets added in:
![rowadded](https://github.com/roshnikutty/med-aid/blob/master/public/images/added_record.png)

Here's a view with mutiple records:
![multiplerecords](https://github.com/roshnikutty/med-aid/blob/master/public/images/multiple%20records.png)

* Retrieve data: You can click on the patient row to see a list of the patient's medical log.


* Delete a record: You can hit the 'Delete record' button to take out that row of data you no longer wish to retain. After deleting, clicking on that patient's row will no longer bring up the record you deleted.


* Update a patient: shows a form with inputs for Patient name, doctor and doctor's contact info. All are mandatory fields.
![updatepatientform](https://github.com/roshnikutty/med-aid/blob/master/public/images/update_patient_form.png)


* Delete a patient: Clicking 'Delete patient' will take out the patient's entry. You will no longer see that patient's row after the page is refreshed.