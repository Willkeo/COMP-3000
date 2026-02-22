//References for functions used in this development file:
//bcrypt (password hashing): https://www.npmjs.com/package/bcrypt
//Password storage best practices (OWASP): https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
//Using prepared statements with better-sqlite3 (prevents injection): https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/api.md

import db from "./database";  //loads database data
import bcrypt from "bcrypt";

export interface User {  //reads data from input
    id?: number;
    username: string;
    email: string;
    password: string;
    points?: number;
}

export function registerUser(user: User): boolean {
    try {
        const hashedPassword = bcrypt.hashSync(user.password, 10); //encrypts the password
        const stmt = db.prepare(
            "INSERT INTO users (username, email, password, points) VALUES (?, ?, ?, ?)"
        );
        stmt.run(user.username, user.email, hashedPassword, user.points || 0);  //validates the details into the database
        return true;
    } catch (error: any) {
        console.error("Registration error:", error.message);  //errors if the formatting is incorrect
        return false;
    }
}

export function loginUser(username: string, password: string): User | null {  //reads login input
    const stmt = db.prepare("SELECT * FROM users WHERE username = ?");  //checks to see if it is in the database
    const user = stmt.get(username) as User | undefined;
    if (!user) return null;
    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) return null;

    return user;

}

export function updateUserProfile(  //the edit user function
    oldUsername: string,  //finds the old username
    newUsername: string,
    newEmail: string
): boolean {
    try {  //updates the users data in the database
        const stmt = db.prepare(`  
            UPDATE users
            SET username = ?, email = ?
            WHERE username = ?
        `);

        stmt.run(newUsername, newEmail, oldUsername);
        return true;
    } catch (error: any) {
        console.error("Profile updating had an error:", error.message);  //error message incase of faliure
        return false;
    }
}

export function addPoints(userId: number, delta: number): number { //function to add points to the user
    try {
        const tx = db.transaction((id: number, d: number) => {
            const update = db.prepare("UPDATE users SET points = points + ? WHERE id = ?");  //updates the points in the database
            const info = update.run(d, id);
            if (info.changes === 0) throw new Error("User was not found");  //error message if the user is not found

            const getStmt = db.prepare("SELECT points FROM users WHERE id = ?");  //gets the new points total for the user
            const rawRow: any = getStmt.get(id);
            const points = (rawRow && typeof rawRow.points === "number") ? rawRow.points : Number(rawRow?.points ?? 0);  //handles the points data and makes sure it is a number
            return points;
        });
        return tx(userId, delta);
    } catch (error: any) {
        console.error("addPoints error:", error?.message ?? error);  //error message for any issues
        throw error;
    }
}



