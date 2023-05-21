



// Hide show password

var passwordInput = document.getElementById("password");
var ConfirmpasswordInput = document.getElementById("confirm-password");
var passwordToggle = document.getElementById("password-toggle");
passwordToggle.addEventListener("click", function() {
  if (passwordInput.type === "password" && ConfirmpasswordInput.type ==="password") {
    passwordInput.type = "text";
    ConfirmpasswordInput.type = "text";
    passwordToggle.innerHTML = '<i class="fa fa-eye-slash"></i> Hide Password';
  } else {
    passwordInput.type = "password";
    ConfirmpasswordInput.type = "password";
    passwordToggle.innerHTML = '<i class="fa fa-eye"></i> Show Password';
  }
});