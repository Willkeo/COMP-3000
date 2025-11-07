"use strict";
document.getElementById("back-btn")?.addEventListener("click", () => {
    window.location.href = "login.html";
});
document.getElementById("register-btn")?.addEventListener("click", () => {
    const tos = document.getElementById("tos").checked; //this ensure terms are checked before account creation
    if (!tos) {
        alert("Please agree to the terms of service");
        return;
    }
    alert("Registration complete (database coming soon!)");
});
//# sourceMappingURL=register.js.map