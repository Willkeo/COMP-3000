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
            //add link to main screen later
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