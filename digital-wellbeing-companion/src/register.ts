document.getElementById("back-btn")?.addEventListener("click", () => {  //return to login on back click
    window.location.href = "login.html";
});

document.getElementById("register-btn")?.addEventListener("click", () => {
    const tos = (document.getElementById("tos") as HTMLInputElement).checked;  //this ensure terms are checked before account creation
    if (!tos) {
        alert("Please agree to the terms of service");
        return;
    }

    alert("Registration complete (database coming soon!)");
});