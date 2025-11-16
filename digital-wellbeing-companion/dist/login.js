"use strict";
document.getElementById("register-btn")?.addEventListener("click", () => {
    window.api.navigate("register.html");
});
document.getElementById("login-btn")?.addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim(); //reads login inputs
    const password = document.getElementById("password").value.trim();
    if (!username || !password) {
        alert("Please enter both username and password."); //validate inputs
        return;
    }
    try {
        const user = await window.api.loginUser(username, password); //sends login request to backend
        if (user) {
            alert(`Welcome back, ${user.username}!`);
            localStorage.setItem("username", user.username); //saves the user data to local storage to be used later
            localStorage.setItem("email", user.email);
            localStorage.setItem("points", user.points.toString());
            window.api.navigate("main.html");
        }
        else {
            alert("Invalid username or password.");
        }
    }
    catch (error) {
        console.error("Login error:", error); //error handling
        alert("An unexpected error occurred while logging in.");
    }
});
//# sourceMappingURL=login.js.map