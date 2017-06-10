// window.Cookies = require('js-cookie');
// import * as Cookies from "js-cookie";

/* POST to /users to create a new user */

function addUser(firstName, lastName, username, password, callback) {
  $.ajax({
    url: "/users",
    contentType: 'application/json',
    type: 'POST',
    dataType: 'json',
    data: JSON.stringify(
      {
        firstName: firstName,
        lastName: lastName,
        username: username,
        password: password
      }
    ),
    success: function (data) {
      callback();
    }
  });
}

/* new user sign up */

$(".register").submit(function (event) {
  event.preventDefault();
  let firstName = $(".register").find(".firstName").val();
  let lastName = $(".register").find(".lastName").val();
  let username = $(".register").find(".username").val();
  let password = $(".register").find(".password").val();
  addUser(firstName, lastName, username, password, hideSignUp);
  console.log("Registered user");
});

function hideSignUp() {
  $("form.register").hide();
  $(".signup-area-box").addClass("loggedInMessage").html("<p>You are now signed up!</p><p>Please login above into your new account.</p>")
}

/* existing user login */

$(".login-form").submit(function (event) {
  event.preventDefault();
  console.log("Test- click function");
  let username = $(".login-form").find(".existing-user").val();
  let password = $(".login-form").find(".existing-user-pwd").val();
  createToken(username, password);          //generates and returns a token

});

/* POST to /users/token to generate token */
function createToken(existing_username, existing_user_pwd) {
  console.log("Test");
  $.ajax({
    url: '/users/token',
    contentType: 'application/json',
    type: 'POST',
    dataType: 'json',
    data: JSON.stringify(
      {
        username: existing_username,
        password: existing_user_pwd
      }),
    success: function (data) {
      Cookies.set('token', data.token, { expires: 7 });
      let loginToken = Cookies.get('token');
      window.location = '/data_input.html';
      return loginToken;
    }
  });
}

