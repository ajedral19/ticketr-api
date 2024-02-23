import { Router } from "express";
import { Login, Signup } from "./Controllers/Users.js";
import { NewOrg } from "./Controllers/Ticket.js";
const router = Router();

router.get("/", (req, res, next) => res.send("Welcome to ticketr"));
router.post("/login", Login);
// router.post("/signup", Signup);

router.use((req, res, next) => res.send({ message: "error. page not found" }));

export { router };
