document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("login-form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Get the username and password from the form
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const apiURL = 'https://gcs-bs-results-vvicnw7txq-uc.a.run.app/token';

        // Define the request data
        const requestData = new URLSearchParams();
        requestData.append('username', username);
        requestData.append('password', password);

        // Create a new XMLHttpRequest object
        const xhr = new XMLHttpRequest();

        // Set up the POST request
        xhr.open('POST', apiURL, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        // Define a callback function to handle the response
        xhr.onload = function () {
            if (xhr.status === 200) {
                // Successful authentication, the access token is in the response JSON
                const response = JSON.parse(xhr.responseText);
                const accessToken = response.access_token;
                console.log('Access Token:', accessToken);

                // Save the access token in localStorage
                localStorage.setItem('access_token', accessToken);

                // Redirect to the index.html page
                window.location.href = '../index.html';
            } else {
                // Authentication failed
                alert("Invalid username or password. Please try again.");
                console.error('Authentication failed. Status code:', xhr.status);
                console.error('Error message:', xhr.responseText);
            }
        };

        // Send the request
        xhr.send(requestData);
    });

    // Check if an access token is present in localStorage
    const accessToken = localStorage.getItem('access_token');

    if (accessToken) {
        // Access token is present, add the event listener for logout
        const logOutButton = document.getElementById("logOut");
        logOutButton.addEventListener("click", function () {
            // Remove the access token from localStorage
            localStorage.removeItem('access_token');
            // Redirect to the login page
            window.location.href = 'login.html';
        });

        // Redirect to the index.html page when the token is present
        window.location.href = '../index.html';
    }
});
