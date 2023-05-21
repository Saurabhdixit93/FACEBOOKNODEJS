// select all like buttons
const likeButtons = document.querySelectorAll('.like-button');

// add click event listener to each button
  likeButtons.forEach(button => {
    button.addEventListener('click', async () => {
    const id = button.getAttribute('data-id');
    const type = button.getAttribute('data-type');
    const url = `/likes/toggle/${type}/${id}`;

try {
  const response = await fetch(url, { method: 'POST' });
  const result = await response.json();

  if (result.success) {
    const countElement = button.nextElementSibling;
    const count = parseInt(countElement.innerText.split(' ')[0]);
    if (result.action === 'like') {
    countElement.innerText = `${count + 1} Likes`;
    button.innerText = 'Unlike';
    }else {
      countElement.innerText = `${count - 1} Likes`;
      button.innerText = 'Like';
    }   
  }
} catch (error) {
    console.error(error);
    }
  });
});

// for post image

const fileInput = document.getElementById('fileInput');
const fileLabel = document.getElementById('fileLabel');
const fileName = document.getElementById('fileName');

fileInput.addEventListener('change', () => {
  const selectedFile = fileInput.files[0];
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
  if (selectedFile && allowedTypes.includes(selectedFile.type)) {
    fileName.innerText = selectedFile.name;
    fileLabel.innerText = 'Selected file:';
  } else {
    fileName.innerText = '';
    fileLabel.innerText = 'Only image file Can Be Posted :';
    fileInput.value = null;
  }
});


