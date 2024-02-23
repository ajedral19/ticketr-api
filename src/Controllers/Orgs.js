import bcrypt from "bcryptjs";
import { Org, User } from "../Schema/ticketr.js";
import jwt from "jsonwebtoken";
import { generate as generateSecret } from "../Utils/secret.util.js";
import { extractTokenData, findOrgBySlug, findTeamInOrgBySlug, userExist, userExistInOrg, userExistInOrgTeam } from "../Utils/util.js";
import { sendMail } from "../Utils/mailer.util.js";
import { flags } from "../constants.js";
import { resolveHostname } from "nodemailer/lib/shared/index.js";
import { parse } from "dotenv";

export const orgRegister = async (req, res, next) => {
    const { name = "", slug = "" } = req.body;
    const { success, fail } = flags;

    if (!name || !slug) return res.status(400).json({ success: fail });

    const { success: org_exist } = await findOrgBySlug(slug);

    if (org_exist) return res.status(400).json({ success: fail, message: "slug is already being used" });
    const payload = { name, slug };

    try {
        let id;
        await Org.create(payload).then((result) => (id = result.id));

        const response = {
            success,
            message: `${name} is now registered`,
            path: `/${slug}`,
        };

        return res.status(200).set("owner", id).json(response);
    } catch (e) {
        res.status(500).json({ success: fail, error: e.message });
    }

    // check if slug is already used

    // sanitize name and slug. slugs white space must be replced by underscore)
    // -> store to org

    // check if login id is separated by dots
    // check if str1 is equal to slug
    // slug must come fron database

    /* 
    let pattern = "^slug\\.[\\w]+$";
    pattern = pattern.replace("slug", slug);
    pattern = new RegExp(pattern);
    const username_valid = pattern.test(username);

    console.log(username_valid);

    return res.send("testing regex");
    */

    // if (password !== repassword) return res.status(400).json({ success: fail, message: "password did not match" });

    // check if slug is already in used

    // check if

    // will add a password formatting condition

    // try {
    //     const secret = generateSecret();
    //     const hashed = await bcrypt.hash(password, 10);

    //     const payload = {
    //         name,
    //         slug,
    //         manager_access: {
    //             email,
    //             login_id: username,
    //             password: hashed,
    //             secret,
    //         },
    //     };

    //     // return something in response
    //     if (await Org.create(payload)) return res.status(200).set("SomeHeader", "imo mama header").send("new org added");
    // } catch (err) {
    //     res.status(400).json({ error: err.message });
    // }
};


export const orgLogin = async (req, res, next) => {
    const { username = "", password = "" } = req.body;
    if (!username || !password) return res.status(400).json({ error: "invalid input" });

    try {
        const admin = await Org.findOne(
            { "manager_access.login_id": username },
            "manager_access.login_id\
            manager_access.password\
            manager_access.secret\
            _id"
        );

        if (!admin) return res.status(403).json({ error: "user does not exists" });

        const { secret, login_id } = admin.manager_access;
        const hashedpassword = admin.manager_access.password;

        const result = await bcrypt.compare(password, hashedpassword);
        if (!result) return res.status(401).json({ error: "incorrect password" });

        const payload = {
            id: admin.id,
        };
        const token = jwt.sign(payload, secret);
        const maxAge = 1000 * 60 * 60 * 24 * 7;
        res.status(200)
            .set("Authorization", `Bearer ${token}`)
            .set("owner", admin._id)
            .set("user-type", "admin")
            .cookie("user", payload, { signed: true, maxAge, httpOnly: true })
            .json(token);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// currently working
export const orgAddTeam = async (req, res, next) => {
    const { name = "", slug = "" } = req.body;
    const { fail, success } = flags;

    if (!name || !slug) return res.status(400).json({ success: fail });
    const id = req.headers.owner;

    // get the list of teams in the org
    const teams = await Org.findById(id, "teams.name teams.slug");

    console.log(teams);
    return res.send("test");

    if (teams.length) {
        let team_exist = false;
        // check if name already exists in team
        team_exist = teams.filter((team) => team.name.split(" ").join("").toLowerCase() == name.split(" ").join("").toLowerCase());
        if (team_exist) return res.status(400).json({ success: fail, message: "team name has been used" });

        team_exist = teams.filter((team) => team.slug == slug);
        if (team_exist) return res.status(400).json({ success: fail, message: "slug is already used" });
        // check if slug already exists in team
    }

    // save the team
    const payload = {
        name,
        slug,
    };
    try {
        await Org.findByIdAndUpdate(id, { teams: { $push: { ...payload } } });
        return res.status(200).json({
            success,
            rows: [payload],
        });
    } catch (e) {
        res.status(500).json({ success: fail, error: e.message });
    }
};

export const orgAddMember = async (req, res, next) => {
    const { org: org_slug } = req.params;

    // check if org does exist / fetch orgs id, teams and members
    const { members } = await findOrgBySlug(org_slug);

    // check if user is a member of the org
    const { email = "" } = req.body;
    const memeber_exists = members.filter((item) => item.email === email);

    if (memeber_exists) return res.status(400).json({ success: fail });

    // verify if orgs id matches the tokens id
    const id = "";

    // save user as member
    try {
        await Org.findByIdAndUpdate(id);
    } catch (e) {
        res.status(500).json({ success: fail, error: e.message });
    }
};

/**
 *
 * @author
 * @returns
 */
// for testing and responses need to reconstruct
export const orgAddMemberToTeam = async (req, res, next) => {
    const { authorization = "" } = req.headers;
    const { org: org_slug, team: team_slug } = req.params;
    const { fail, success } = flags;

    // check if org does exist / fetch orgs id, teams and members
    const org = await findOrgBySlug(org_slug);

    // check if team does exist within the org
    const [team] = org.teams.filter((item) => item.slug === team_slug);
    if (!team) return res.status(404).json({ success: fail });

    // verify if orgs id matches the tokens id
    const { id = "" } = extractTokenData(authorization);
    if (id !== org.id) return res.status(400).json({ success: fail });

    // check if user is a member of the org
    const email = req.body.email;
    const member = org.members.filter(member.email === email);
    if (!member) return res.status(400).send({ success: fail });

    // check if the user is a memeber of a team
    const team_member = team.member.filter((item) => item.email === email);
    if (team_member) return res.status(404).json({ success: fail });

    // save user to the team
    try {
        await Org.findByIdAndUpdate(id, { members: { $push: { email: member.email, user_id: member.user_id } } }, { self: true, upsert: true });
        const payload = {
            email,
        };
        return res.status(200).json({
            success,
            rows: [payload],
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const orgResigterPresets = async (req, res, next) => {
    try {
        return res.status(200).json({ message: "okay" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const forTestPurposesOnly = () => {
    return "Hello";
};
