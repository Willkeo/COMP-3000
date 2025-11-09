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