// Get the input element
const input = document.getElementById('profile_picture');
  
// Get the preview element
const preview = document.getElementById('preview');

// Get the remove button element
const removeButton = document.getElementById('remove_preview');

// Add an event listener to the input element to listen for changes
input.addEventListener('change', function() {
  // Get the selected file
  const file = input.files[0];
  
  // If a file was selected, display a preview of the image and show the remove button
  if (file) {
    // Create a new FileReader object
    const reader = new FileReader();
    
    // Set the onload function to display the preview image and show the remove button
    reader.onload = function() {
      preview.src = reader.result;
      preview.style.display = 'block'; // Show the preview image
      removeButton.style.display = 'block'; // Show the remove button
    };
    
    // Read the selected file as a data URL
    reader.readAsDataURL(file);
  } else {
    // If no file was selected, clear the preview image and hide it and the remove button
    preview.src = '';
    preview.style.display = 'none';
    removeButton.style.display = 'none';
  }
});

// Add an event listener to the remove button to clear the selected file and hide the preview image
removeButton.addEventListener('click', function() {
  input.value = null; // Clear the selected file
  preview.src = ''; // Clear the preview image
  preview.style.display = 'none'; // Hide the preview image
  removeButton.style.display = 'none'; // Hide the remove button
});

// For password show button
var passwordInput = document.getElementById("password");
var passwordToggle = document.getElementById("password-toggle");
passwordToggle.addEventListener("click", function() {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      passwordToggle.innerHTML = '<i class="fa fa-eye-slash"></i> Hide Password';
    } else {
      passwordInput.type = "password";
      passwordToggle.innerHTML = '<i class="fa fa-eye"></i> Show Password';
    }
  });

  
