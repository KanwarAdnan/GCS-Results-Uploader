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
    const apiUrl = 'https://gcs-bs-results-vvicnw7txq-uc.a.run.app/upload/';
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
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
