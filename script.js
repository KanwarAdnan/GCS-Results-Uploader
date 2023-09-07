// Get DOM elements
const fileInput = document.getElementById('fileInput');
const fileTableBody = document.querySelector('#fileTable tbody');
const uploadButton = document.getElementById('uploadButton');
const clearButton = document.getElementById('clearButton');
const fileTable = document.getElementById('fileTable');

// Event listeners
clearButton.addEventListener('click', clearFileInput);

uploadButton.addEventListener('click', () => {
  toggleFileTable();
  handleFileUpload();
});

// Function to show or hide the table
function toggleFileTable() {
  if (fileInput.files.length > 0) {
    fileTable.style.display = 'table';
  } else {
    fileTable.style.display = 'none';
  }
}

async function handleFileUpload() {
  const files = fileInput.files;
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
      await uploadFile(file, row);
    } catch (error) {
      console.error('Upload error:', error);
      row.querySelector('td:nth-child(3)').textContent = 'Failed';
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
    const apiUrl = 'https://gcs-bs-results-vvicnw7txq-uc.a.run.app/upload';
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
