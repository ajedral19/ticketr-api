import { Router } from "express";
import { isLoggedIn } from "../src/Middleware/auth.middleware.js";
import { NewChecklistItem, NewTicket } from "../src/Controllers/Ticket.js";
import { Login, Signup, completeProfile, getUser } from "../src/Controllers/Users.js";

const router = Router();

router.get("/", isLoggedIn, async (req, res, next) => {
    try {
        res.json({ message: "Hello, welcome user", user: req.user });
    } catch (err) {
        res.json({ error: err });
    }
});

router.post("/complete-profile", isLoggedIn, completeProfile);

// ticket routes
router.get("/ticket", isLoggedIn, (req, res, next) => res.send("okay"));
router.post("/ticket/add", isLoggedIn, NewTicket);
// ticket checklist
router.post("/ticket/:ticket_id/checklist/add", isLoggedIn, NewChecklistItem);

router.get("/:id", getUser);

router.use((req, res, next) => res.send("cannot find in user path"));

const UserRoutes = router;

export default UserRoutes;
