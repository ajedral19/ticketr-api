import { Org } from "../Schema/ticketr.js";
import bcrypt from "bcryptjs";

export const NewTicket = async (req, res, next) => {
    try {
        res.send("okay");
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const NewChecklistItem = (req, res, next) => {
    try {
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// org controllers
export const NewOrg = async (req, res, next) => {
    const { organization = "" } = req.body;
    const { email = "", login_id = "", password = "" } = req.body.credentials;

    const hashed = await bcrypt.hash(password, 10);

    try {
        const payload = {
            name: organization,
            manager_access: {
                email,
                login_id,
                password: hashed,
                secret: "",
            },
        };

        const org = await Org.create(payload);
        res.status(200).json(org);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const addMember = async (req, res, next) => {
    const { member_id = "" } = req.body;
    try {
        const payload = member_id;

        const member = Org.members;
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
