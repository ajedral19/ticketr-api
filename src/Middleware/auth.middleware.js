import { config } from "dotenv";
import jwt from "jsonwebtoken";
import { Org, User } from "../Schema/ticketr.js";
import { user_types } from "../constants.js";
import cookieParser from "cookie-parser";

const env = config().parsed;

const authenticate = (req, res, next) => async (fethcer) => {
    const { authorization = "", owner = "" } = req.headers;
    if (!authorization || !owner) return res.status(403).json({ message: "Access not granted" });

    const token = authorization.split(" ")[1];
    if (!token) return res.status(403).json({ message: "malformed authorization header" });

    try {
        const data = await fethcer();

        if (!data) return res.status(401).json({ message: "invalid token" });
        const secret = data.secret;
        if (!secret) return res.status(401).json({ message: "token expires or tampered" });
        const payload = jwt.verify(token, secret);

        if (!payload) return res.status(401).json({ message: "token verification failed" });

        req.user = payload;
        next();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const isLoggedIn = (req, res, next) => {
    authenticate(
        req,
        res,
        next
    )(async () => {
        const user = await User.findOne({ _id: req.headers.owner }, "user_credentials.secret");
        return { secret: user?.user_credentials.secret };
    });
};

export const orgIsLoggedIn = (req, res, next) => {
    authenticate(
        req,
        res,
        next
    )(async () => {
        const user = await Org.findOne({ _id: req.headers.owner }, "manager_access.secret");
        return { secret: user?.manager_access.secret };
    });
};
