const fileInput = document.getElementById('fileInput');
const fileTableBody = document.querySelector('#fileTable tbody');
const uploadButton = document.getElementById('uploadButton');
const fileTable = document.getElementById('fileTable');
const uploadStatusMessage = document.getElementById('uploadStatusMessage');

let uploadedFiles = 0;
let failedFiles = 0;
let selectedFiles = [];

uploadButton.style.display = 'none';

uploadButton.addEventListener('click', () => {
  uploadStatusMessage.textContent = '';
  toggleFileTable();
  clearFileTable();
  handleFileUpload(selectedFiles);
});

function toggleFileTable() {
  fileTable.style.display = selectedFiles.length > 0 ? 'table' : 'none';
  
  if (selectedFiles.length > 0) {
    showUploadButton();
  } else {
    uploadStatusMessage.textContent = 'No files selected.';
    uploadButton.style.display = 'none';
  }
}


function showUploadButton() {
  uploadButton.style.display = 'inline'; 
}

function clearFileInput() {
  fileInput.value = '';
  fileTableBody.innerHTML = '';
  fileTable.style.display = 'none';
  uploadedFiles = 0;
  failedFiles = 0;
  selectedFiles = [];
  uploadButton.style.display = 'none'; 
}

fileInput.addEventListener('change', () => {
  fileTableBody.innerHTML = '';
  const files = fileInput.files;
  for (const file of files) {
    if (!file.name.endsWith('.zip')) continue;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${file.name}</td>
      <td>${formatFileSize(file.size)}</td>
      <td>Waiting</td>
      <td><progress value="0" max="100"></progress></td>
      <td><button class="delete-button">X</button></td>
    `;
    fileTableBody.appendChild(row);
    const deleteButton = row.querySelector('.delete-button');
    deleteButton.addEventListener('click', () => {
      fileTableBody.removeChild(row);
      selectedFiles = selectedFiles.filter((selectedFile) => selectedFile !== file);
      toggleFileTable();
      updateStatusMessageOnFileChange();
    });
    selectedFiles.push(file);
  }
  toggleFileTable();
  updateStatusMessageOnFileChange();
});

async function handleFileUpload(filesToUpload) {
  const uploadPromises = [];

  for (const file of filesToUpload) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${file.name}</td>
      <td>${formatFileSize(file.size)}</td>
      <td>Uploading...</td>
      <td><progress value="0" max="100"></progress></td>
      <td><button class="delete-button">X</button></td>
    `;
    fileTableBody.appendChild(row);
    const uploadPromise = uploadFile(file, row)
      .then((status) => {
        if (status === 200) uploadedFiles++;
        else failedFiles++;
      })
      .catch(() => {
        row.querySelector('td:nth-child(3)').textContent = 'Failed';
        failedFiles++;
      });
    uploadPromises.push(uploadPromise);
    const deleteButton = row.querySelector('.delete-button');
    deleteButton.addEventListener('click', () => {
      fileTableBody.removeChild(row);
      selectedFiles = selectedFiles.filter((selectedFile) => selectedFile !== file);
      toggleFileTable();
    });
  }

  try {
    await Promise.all(uploadPromises);
  } catch (error) {
    console.error('One or more uploads failed:', error);
  }

  updateUploadStatusMessage(uploadedFiles, failedFiles);
  clearFileInput();
}

async function uploadFile(file, row) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const apiUrl = 'https://gcs-vvicnw7txq-uc.a.run.app/upload/';
    const accessToken = localStorage.getItem('access_token');
    const headers = new Headers({
      'Authorization': `Bearer ${accessToken}`,
    });
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      headers: headers,
    });

    if (response.status === 200) {
      row.querySelector('td:nth-child(3)').textContent = 'Uploaded';
      row.querySelector('progress').value = 100;
      return 200;
    } else {
      row.querySelector('td:nth-child(3)').textContent = 'Failed';
      return response.status;
    }
  } catch (error) {
    console.error('Upload error:', error);
    row.querySelector('td:nth-child(3)').textContent = 'Failed';
    return 500;
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function clearFileTable() {
  fileTableBody.innerHTML = '';
  toggleFileTable();
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
  uploadStatusMessage.textContent = selectedFiles.length > 0
    ? `Number of files selected: ${selectedFiles.length}. Press upload.`
    : '';
}

document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem('access_token');
  if (token) {
    const logOutButton = document.getElementById('logOut');
    logOutButton.addEventListener('click', () => {
      localStorage.removeItem('access_token');
      window.location.href = 'login/login.html';
    });
  } else {
    const loginButton = document.getElementById('loginButton');
    loginButton.addEventListener('click', () => {
      window.open('login/login.html', '_blank');
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    const logOutButton = document.getElementById("logOut");
    logOutButton.addEventListener("click", function () {
      localStorage.removeItem('access_token');
      window.location.href = 'login/login.html';
    });
  } else {
    window.location.href = 'login/login.html';
  }
});
