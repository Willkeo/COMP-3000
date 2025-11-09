document.addEventListener("DOMContentLoaded", () => {
    const backBtn = document.getElementById("back-btn");
    const registerBtn = document.getElementById("register-btn");

    backBtn?.addEventListener("click", () => {
        (window as any).api.navigate("login.html");
    });

    registerBtn?.addEventListener("click", async () => {
        const username = (document.getElementById("username") as HTMLInputElement).value.trim(); //reads data from inputs
        const email = (document.getElementById("email") as HTMLInputElement).value.trim();
        const password = (document.getElementById("password") as HTMLInputElement).value.trim();

        if (!username || !email || !password) {
            alert("Please ensure all info is filled.");  //message is displayed if users dont fill in all the data
            return;
        }

        const tos = (document.getElementById("tos") as HTMLInputElement).checked;  //this ensure terms are checked before account creation
        if (!tos) {
            alert("Please agree to the terms of service");
            return;
        }

        try {
        
            const success = await (window as any).api.registerUser({ username, email, password });  //if login sucessful
            if (success) {
                alert("Registration successful! Please login.");
                (window as any).api.navigate("login.html"); 
            } else {
                alert("Registration failed.");  //error if something goes wrong
            }
        } catch (error) {
            console.error("Registration error:", error);
            alert("There is an error");
        }

    });
});