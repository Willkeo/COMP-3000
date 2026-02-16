"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.updateUserProfile = updateUserProfile;
exports.addPoints = addPoints;
const database_1 = __importDefault(require("./database")); //loads database data
const bcrypt_1 = __importDefault(require("bcrypt"));
function registerUser(user) {
    try {
        const hashedPassword = bcrypt_1.default.hashSync(user.password, 10); //encrypts the password
        const stmt = database_1.default.prepare("INSERT INTO users (username, email, password, points) VALUES (?, ?, ?, ?)");
        stmt.run(user.username, user.email, hashedPassword, user.points || 0); //validates the details into the database
        return true;
    }
    catch (error) {
        console.error("Registration error:", error.message); //errors if the formatting is incorrect
        return false;
    }
}
function loginUser(username, password) {
    const stmt = database_1.default.prepare("SELECT * FROM users WHERE username = ?"); //checks to see if it is in the database
    const user = stmt.get(username);
    if (!user)
        return null;
    const passwordMatch = bcrypt_1.default.compareSync(password, user.password);
    if (!passwordMatch)
        return null;
    return user;
}
function updateUserProfile(//the edit user function
oldUsername, //finds the old username
newUsername, newEmail) {
    try { //updates the users data in the database
        const stmt = database_1.default.prepare(`  
            UPDATE users
            SET username = ?, email = ?
            WHERE username = ?
        `);
        stmt.run(newUsername, newEmail, oldUsername);
        return true;
    }
    catch (error) {
        console.error("Profile updating had an error:", error.message); //error message incase of faliure
        return false;
    }
}
function addPoints(userId, delta) {
    try {
        const tx = database_1.default.transaction((id, d) => {
            const update = database_1.default.prepare("UPDATE users SET points = points + ? WHERE id = ?");
            const info = update.run(d, id);
            if (info.changes === 0)
                throw new Error("User not found");
            const getStmt = database_1.default.prepare("SELECT points FROM users WHERE id = ?");
            const rawRow = getStmt.get(id);
            const points = (rawRow && typeof rawRow.points === "number") ? rawRow.points : Number(rawRow?.points ?? 0);
            return points;
        });
        return tx(userId, delta);
    }
    catch (error) {
        console.error("addPoints error:", error?.message ?? error);
        throw error;
    }
}
//# sourceMappingURL=userService.js.map