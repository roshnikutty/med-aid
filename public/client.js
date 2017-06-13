function patientItemTemplate(id) {
  return `<div data-id="${id}"  class="row patient-row">` +
             '<div class = "col-md-12">' +
                '<div class = "row selectable"> ' 
                    +'<div class="col-md-3 js-patient"></div>' +
                     '<div class="col-md-3 js-doctor"></div>' +
                     '<div class="col-md-3 js-contact"></div>' +
                     '<div class="col-md-3 js-patient-controls">' +
                          '<div><button class="js-update"> Update patient' +
                          '</button>' +
                          '<button class="js-delete">' +
                          '<span class="button-label">Delete patient</span>' +
                          '</button></div>' +
                      '</div>' +
                    '<button class="js-add-history">' +
                        '<span class="button-label">Add record</span>' +
                    '</button>' +
               '</div>' +
            '<div class="row js-entry-output">' +
            '</div>' +
          '</div>'
    + '</div>'
}
let newMedRecordTemplate = (
  '<form name="js-history-form" action="" method="post">' +
  '<div class="row">' +
  '<div class="col-md-3">' +
  '<div>' +
  '<input type="text" class="blank date_time" name="date_time" type="text" id="date_time" placeholder="Date, Time" required>' +
  '</div>' +
  '</div>' +
  '<div class="col-md-3">' +
  '<div>' +
  '<input type="text" class="blank symptoms" name="symptoms" type="text" id="symptoms" placeholder="Symptoms">' +
  '</div>' +
  '</div>' +
  '<div class="col-md-3">' +
  '<div>' +
  '<input type="text" class="blank meds" name="meds" type="text" id="meds" placeholder="Medication">' +
  '</div>' +
  '</div>' +
  '<div class="col-md-3">' +
  '<button class = "js-save"> Save' +
  '</button>' +
  '</div>' +
  '</div>' +
  '</form>'
);

let updatePatientTemplate = ('<div>' +
  '<form name="js-update-patient-form" action="" method="put">' +
  ' <div class="row">' +
  '<div class="col-md-3">' +
  '<input type="text" class="blank update-patient" name="update-patient" type="text" id="update-patient" placeholder="Patient\'s name" required>' +
  '</div>' +
  '<div class="col-md-3">' +
  '<input type="text" class="blank update-doctor" name="update-doctor" type="text" id="update-doctor" placeholder="Doctor">' +
  '</div>' +
  '<div class="col-md-3">' +
  '<input type="text" class="blank update-contact" name="update-contact" type="text" id="update-contact" placeholder="Doctor\'s contact">' +
  '</div>' +
  '<div class="col-md-3">' +
  '<button class = "js-save-update"> Save' +
  '</button>' +
  '</div>' +
  '</div>' +
  '</form>' +
  '</div>'
);

function historyItemTemplate(id) {
  return `<div data-id="${id}"  class="row history-row">` +
    '<div class="col-md-3 js-history-date_time"></div>' +
    '<div class="col-md-3 js-history-symptoms"></div>' +
    '<div class="col-md-3 js-history-meds"></div>' +
    '<div class="col-md-3 js-history-controls">' +
    '<div>' +
    // '<button class="js-history-update"> Update record' +
    // '</button>' +
    '<button class="js-history-delete">Delete record</button>' +
    '</div>' +
    '</div>'
}


let state = [];
let addhistoryState = [];

function addItem(patient, doctor, contact) {
  let patientInputObj = {
    patient: patient,
    doctor: doctor,
    contact: contact
  };
  state.push(patientInputObj);
  return state;
}

function addHistoryItem(date_time, symptoms, meds) {
  let historyInputObj = {
    date_time: date_time,
    symptoms: symptoms,
    meds: meds
  };
  addhistoryState.unshift(historyInputObj);
  return addhistoryState;
}

//Add patient entry from form and make POST request
$(".js-add-entry-btn").click(function (event) {
  event.preventDefault();
  addItem($(".patient").val(), $(".doctor").val(), $(".contact").val());  //add form input to state[]
  addPatient(state[0]);                         //new patient's info is sent on a POST req. to server
  $(".add_entry_btn").hide();
  $('form[name = "js-patient-form"]')[0].reset();
});


function getAndDisplayPatientList() {
let token = Cookies.get('token');
  $.ajax({
    url:'/patients',
    beforeSend: (req) => {req.setRequestHeader("Authorization", `JWT ${token}`)},
    dataType: "json",
    success: function (items) {
    console.log('Rendering patient list');
    
    let itemElements = items.patients.map(function (item) {
      let element = $(patientItemTemplate(item.patient_id));
      // element.attr('id', item.patient_id);
      element.find('.js-patient').text(item.patient);
      element.find('.js-doctor').text(item.doctor);
      element.find('.js-contact').text(item.contact);

      //Update Patient button function
      element.find('.js-update').click((event) => {
        $(event.target).closest('.patient-row').append(updatePatientTemplate);
        $(event.target).closest('.js-patient-controls').siblings('.js-add-history').hide();
        $(event.target).closest('.js-patient-controls').hide();
        //Clicking Save-Updates
        $(".js-patient-output").on("click", ".js-save-update", function (event) {
          //get updated patient data from form into an object
          event.preventDefault();
          let updatedPatient = {
            patient: $(".update-patient").val(),
            doctor: $(".update-doctor").val(),
            contact: $(".update-contact").val()
          };
          updatePatientEntry(updatedPatient, item.patient_id);
          $('.js-patient-output').empty();
          getAndDisplayPatientList();
        });
      });

      //Delete Patient button function
      element.find('.js-delete').click((event) => {
        console.log(`Deleting selected patient: ${item.patient}`);
        deletePatientEntry(item.patient_id);
        $('.js-patient-output').empty();
        getAndDisplayPatientList();
      });

      return element;
    });

    $('.js-patient-output').append(itemElements);
    }
  });
}

//add medical record make post request
$("body").on("click", ".js-save", function (event) {
  let retrieveID = $(this).parents(".patient-row").data("id");
  console.log(retrieveID);
  event.preventDefault();
  addHistoryItem($(".date_time").val(), $(".symptoms").val(), $(".meds").val());        //Add form input to historyState attay
  addHistory(addhistoryState[0], retrieveID);                                         //new history info is sent on a POST req. to server
  $(".js-save").hide();
  $('form[name = "js-history-form"]')[0].reset();
  $('form[name = "js-history-form"]').hide();
  $(".js-add-history").show();
});



function addPatient(newPatient) {
  let token = Cookies.get('token');
  $.ajax({
    method: "POST",
    url: "/patients",
    beforeSend: (req) => {req.setRequestHeader("Authorization", `JWT ${token}`)},
    contentType: "application/json",                                  //content input is in json format
    data: JSON.stringify(newPatient),
    dataType: "json",                                                 //datatype from server output is in json format
    success: function (data) {
      $('.js-patient-output').empty();
      getAndDisplayPatientList();
      console.log("Patient entry added!");
    }
  });
}


function updatePatientEntry(updatedPatient, patient_id) {
  let token = Cookies.get('token');
  $.ajax({
    method: "PUT",
    url: "/patients/" + patient_id,
    beforeSend: (req) => {req.setRequestHeader("Authorization", `JWT ${token}`)},
    contentType: "application/json",
    data: JSON.stringify(updatedPatient),
    dataType: "json",
    context: "patient-row",
    success: function () {
      console.log("Update was successful!");
      return;
    }
  });
}

function deletePatientEntry(patientId) {
  let token = Cookies.get('token');
  $.ajax({
    url: "/patients/" + patientId,
    beforeSend: (req) => {req.setRequestHeader("Authorization", `JWT ${token}`)},
    method: "DELETE",
    data: {},
    contentType: 'application/json',
    dataType: 'text',                                                 //boolean output
    success: function (data) {
      console.log("Patient deleted successfully!");
    }
  });
}


function addHistory(newHistory, patient_id) {
  console.log(newHistory);
  $.ajax({
    method: "POST",
    url: "/patients/" + patient_id + "/histories",
    contentType: "application/json",                                  //content input is in json format
    data: JSON.stringify(newHistory),
    dataType: "json",                                                 //datatype from server output is in json format
    success: function (data) {
      alert('Medical record was added successfully!');
    }
  });
}

//Show medical record form
$(".js-patient-output").on("click", ".js-add-history", function () {
  event.preventDefault();
  $(this).parent().append($(newMedRecordTemplate));   //reveal a form to input date/time, symptoms and medications
  $(event.target).parent().parent().find(".js-patient-controls").hide();
  $(this).hide();
});

//Get a patient's medical record
$(".js-patient-output").on("click", ".selectable", function () {
  event.preventDefault();
  let parent = $(this).closest(".patient-row");
  let active = $(parent).find(".js-entry-output.active").length;
  $(".js-entry-output.active").toggleClass("active");
  if (active == 0) {
    $(".js-entry-output", $(parent)).toggleClass("active");
    let retrieveID = $(parent).data("id");
    getAndDisplayPatientHistory(retrieveID, $(event.target));
  }
});
let historyState;
function getAndDisplayPatientHistory(patientsId, patientRow) {
  let url = `/patients/${patientsId}/histories`
  $.getJSON(url, function (items) {
    console.log('Rendering history list');
    console.log(items);
    historyState = items;
    render();
  });
}

//Delete medical record
$(".js-patient-output").on("click", ".js-history-delete", function () {
  event.preventDefault();
  let retrievePatientID = $(this).parents(".patient-row").data("id");
  let retrieveHistoryID = $(this).parents(".history-row").data("id");
  deleteHistory(retrievePatientID, retrieveHistoryID);
});

function deleteHistory(patientID, historyID) {
  $.ajax({
    url: `/patients/${patientID}/${historyID}`,
    method: "DELETE",
    contentType: 'application/json',
    dataType: 'text',
    success: function (data) {
      console.log("Medical record deleted successfully!");
      $('.js-patient-output').empty();
      getAndDisplayPatientList();
    }
  });
}

function render() {
  let table = $(".js-entry-output.active");
  table.empty();
  console.log(table);
  console.log(historyState);
  historyState.history.map(function (item) {

    let element = $(historyItemTemplate(item._id));
    element.find('.js-history-date_time').text(item.date_time);
    element.find('.js-history-symptoms').text(item.symptoms);
    element.find('.js-history-meds').text(item.meds);
    table.append(element);

  });
}

$(getAndDisplayPatientList);