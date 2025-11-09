"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
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
//# sourceMappingURL=userService.js.map