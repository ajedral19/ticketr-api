import bcrypt from "bcryptjs";
import { User } from "../Schema/ticketr.js";
import jwt from "jsonwebtoken";
import { generate as generateSecret } from "../Utils/secret.util.js";

export const Signup = async (req, res, next) => {
    const { first_name = "", last_name = "", email = "", username = "", password = "" } = req.body;
    const secret = generateSecret();
    try {
        const hashed = await bcrypt.hash(password, 10);

        const payload = {
            user_first_name: first_name,
            user_last_name: last_name,
            user_credentials: {
                email,
                username,
                password: hashed,
                secret,
            },
        };

        const user = await User.create(payload);
        res.status(200).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const Login = async (req, res, next) => {
    const { login_id = "", password = "" } = req.body;
    if (!login_id || !password) return res.status(400).json({ error: "invalid input" });

    try {
        const user = await User.findOne(
            { "user_credentials.email": login_id },
            "user_credentials.email\
            user_credentials.username\
            user_credentials.password\
            user_credentials.secret"
        );

        if (!user) return res.status(400).json({ error: "User doesn't exist" });
        console.log(user.user_credentials.secret);

        const hashedpassword = user.user_credentials.password;
        console.log(hashedpassword);
        const result = await bcrypt.compare(password, hashedpassword);
        if (!result) return res.status(400).json({ error: "password doesn't match" });

        const payload = {
            username: user.user_credentials.username,
        };

        const secret = user.user_credentials.secret;
        const token = jwt.sign(payload, secret);
        const maxAge = 1000 * 60 * 60 * 24 * 7;
        return res
            .status(200)
            .set("Authorization", `Bearer ${token}`)
            .set("owner", user.id)
            .set("user-type", "member")
            .cookie("user", payload, { signed: true, maxAge, httpOnly: true, path: "dashboard" })
            .json(token);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

export const completeProfile = async (req, res, next) => {
    try {
        console.log(req.body);
        // regenerate secret
        res.send("completed");
    } catch (err) {
        res.statsu(400).json({ error: err.message });
    }
};

export const getUser = async (req, res, next) => {
    res.status(200).send("okay");
    const user = await User.findOne({ _id: req.params.id }, "_id");
    console.log(user);
};
