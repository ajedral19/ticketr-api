import { Router } from "express";
import { orgIsLoggedIn } from "../src/Middleware/auth.middleware.js";
import { orgLogin, orgAddTeam, orgAddMember, orgResigterPresets, orgAddMemberToTeam } from "../src/Controllers/Orgs.js";
import { Login, Register, RegisterCredentials, VerifyRegistration } from "../src/Controllers/Org/index.js";

const router = Router();

router.get("/", orgIsLoggedIn, (req, res, next) => res.json({ message: "great!" }));

router.post("/admin/login", Login); // ok
router.post("/register", Register); // ok
router.patch("/:org/save-credentials", RegisterCredentials); // ok but working with email verification
router.patch("/:org/verify/:id/:token", VerifyRegistration); // working

// org routes
router.get("/:org/teams", orgIsLoggedIn, (req, res, next) => {});
router.get("/:org/teams/:name", orgIsLoggedIn, (req, res, next) => {});
router.get("/:org/teams/:slug/members/remove", orgIsLoggedIn, (req, res, next) => {});

router.post("/:org/team/register", orgIsLoggedIn, orgAddTeam); // wip
router.post("/:org/members/add", orgIsLoggedIn, orgAddMember); // to do
router.post("/:org/:team/members/add", orgIsLoggedIn, orgAddMemberToTeam); // for testing
// end org routes

router.post("/member/register", orgIsLoggedIn, orgAddMember);
router.get("/member/:username", orgIsLoggedIn, (req, res, next) => {});
router.get("/member/deactivate", orgIsLoggedIn, (req, res, next) => {});
router.get("/member/remove", orgIsLoggedIn, (req, res, next) => {});
router.get("/members", orgIsLoggedIn, (req, res, next) => {});

router.post("/presets/register", orgIsLoggedIn, orgResigterPresets);
router.get("/presets", orgIsLoggedIn, (req, res, next) => {});

const OrgRoutes = router;

export default OrgRoutes;
