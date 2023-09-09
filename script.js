const fileInput = document.getElementById('fileInput');
const fileTableBody = document.querySelector('#fileTable tbody');
const uploadButton = document.getElementById('uploadButton');
const clearButton = document.getElementById('clearButton');
const fileTable = document.getElementById('fileTable');
const uploadStatusMessage = document.getElementById('uploadStatusMessage');

let uploadedFiles = 0;
let failedFiles = 0;

uploadButton.addEventListener('click', () => {
  uploadStatusMessage.textContent = '';
  toggleFileTable();
  handleFileUpload();
});

function toggleFileTable() {
  fileTable.style.display = fileInput.files.length > 0 ? 'table' : 'none';
}

fileInput.addEventListener('change', () => {
  updateStatusMessageOnFileChange();
});

function handleFileUpload() {
  const files = fileInput.files;
  const totalFiles = files.length;

  for (const file of files) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${file.name}</td>
      <td>${formatFileSize(file.size)}</td>
      <td>Uploading...</td>
      <td><progress value="0" max="100"></progress></td>
      <td><button class="delete-button">X</button></td>
    `;
    fileTableBody.appendChild(row);

    try {
      uploadFile(file, row).then(() => {
        uploadedFiles++;
        if (uploadedFiles + failedFiles === totalFiles) {
          updateUploadStatusMessage(uploadedFiles, failedFiles);
          clearFileInput();
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      row.querySelector('td:nth-child(3)').textContent = 'Failed';
      failedFiles++;
      if (uploadedFiles + failedFiles === totalFiles) {
        updateUploadStatusMessage(uploadedFiles, failedFiles);
        clearFileInput();
      }
    }

    const deleteButton = row.querySelector('.delete-button');
    deleteButton.addEventListener('click', () => {
      fileTableBody.removeChild(row);
    });
  }
}

function clearFileInput() {
  fileInput.value = '';
  fileTableBody.innerHTML = '';
  fileTable.style.display = 'none';
  uploadedFiles = 0;
  failedFiles = 0;
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function uploadFile(file, row) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const apiUrl = 'https://gcs-vvicnw7txq-uc.a.run.app/upload/';
    
    // Get the access token from localStorage
    const accessToken = localStorage.getItem('access_token');
    
    // Create headers with the access token
    const headers = new Headers({
      'Authorization': `Bearer ${accessToken}`,
    });
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      headers: headers, // Add headers to the request
    });

    if (response.ok) {
      row.querySelector('td:nth-child(3)').textContent = 'Uploaded';
      row.querySelector('progress').value = 100;
    } else {
      row.querySelector('td:nth-child(3)').textContent = 'Failed';
    }
  } catch (error) {
    console.error('Upload error:', error);
    row.querySelector('td:nth-child(3)').textContent = 'Failed';
  }
}


function updateUploadStatusMessage(uploaded, failed) {
  const totalFiles = uploaded + failed;
  const message = `${uploaded} out of ${totalFiles} files uploaded successfully.`;
  uploadStatusMessage.textContent = failed > 0
    ? `${message} ${failed} files failed to upload.`
    : message;
}

function updateStatusMessageOnFileChange() {
  const selectedFilesCount = fileInput.files.length;
  uploadStatusMessage.textContent = selectedFilesCount > 0
    ? `Number of files selected: ${selectedFilesCount}. Press upload.`
    : '';
}

// Your existing main page JavaScript code goes here (the code you provided earlier).

// Check if a token is present in localStorage when the page loads
document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('access_token');
    if (token) {
        // Token is present, do something with it (e.g., display authenticated content)
        // For example, you can make authenticated API requests using the token.
        // You can also redirect to a different page or perform other actions.
        console.log('Authenticated with token:', token);

        // Add an event listener to the logout button
        const logOutButton = document.getElementById('logOut');
        logOutButton.addEventListener('click', () => {
            // Clear the token from localStorage
            localStorage.removeItem('access_token');

            // Redirect to the login page
            window.location.href = 'login/login.html'; // Replace with the actual login page URL
        });
    } else {
        // Token is not present, add an event listener to open the login page
        const loginButton = document.getElementById('loginButton');
        loginButton.addEventListener('click', () => {
            // Open the login page in a new window or redirect to it
            // You can customize this behavior based on your requirements
            window.open('login/login.html', '_blank'); // Opens the login page in a new window
            // Alternatively, you can use window.location.href to redirect
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    // Check if the access token is present in localStorage
    const accessToken = localStorage.getItem('access_token');

    if (accessToken) {
        // Access token is present, add the event listener for logout
        const logOutButton = document.getElementById("logOut");
        logOutButton.addEventListener("click", function () {
            // Remove the access token from localStorage
            localStorage.removeItem('access_token');
            // Redirect to the login page or perform any other actions you need
            // For example, you can redirect to the login page:
            window.location.href = 'login/login.html';
        });
    } else {
        // Access token is not present, handle this scenario (e.g., show the login form)
        // You can display the login form or perform other actions here
        // For example, you can show a message or redirect to the login page:
        window.location.href = 'login/login.html';
    }
});
