document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("login-form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Get the username and password from the form
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Replace with your API URL
        const apiURL = 'https://gcs-vvicnw7txq-uc.a.run.app/token';

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

                // Set the access token in localStorage with an expiration of 1 day
                const expirationTime = new Date().getTime() + (1 * 24 * 60 * 60 * 1000); // 1 day in milliseconds
                localStorage.setItem('access_token', accessToken);
                localStorage.setItem('access_token_expiration', expirationTime);

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

    // Check if an access token is present in localStorage and if it has expired
    const accessToken = localStorage.getItem('access_token');
    const expirationTime = localStorage.getItem('access_token_expiration');
    const currentTime = new Date().getTime();

    if (accessToken && expirationTime && currentTime < expirationTime) {
        // Access token is present and has not expired
        // Add the event listener for logout
        const logOutButton = document.getElementById("logOut");
        logOutButton.addEventListener("click", function () {
            // Remove the access token and expiration time from localStorage
            localStorage.removeItem('access_token');
            localStorage.removeItem('access_token_expiration');
            // Redirect to the login page
            window.location.href = 'login.html';
        });

        // Redirect to the index.html page when the token is present and valid
        window.location.href = '../index.html';
    }
});
