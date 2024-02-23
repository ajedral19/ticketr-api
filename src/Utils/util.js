import { Org, User } from "../Schema/ticketr.js";
import jwt from "jsonwebtoken";
import { flags } from "../constants.js";

/**
 *
 * @param {String} email
 * @returns {boolean}
 */
export const userExist = async (email) => {
    if (!email) return false;
    return !!(await User.findOne({ "user_credentials.email": email }, "user_credentials.email"));
};

/**
 *
 * @param {String} email
 * @param {String} org_id
 * @returns {boolean}
 */
export const userExistInOrg = async (email, org_id) => {
    let result = false;
    const { members = null } = await Org.findOne({ _id: org_id }, "members");

    if (members) {
        members.filter((item) => {
            if (item.email == email) result = true;
        });
    }

    return result;
};

/**
 *
 * @param {String} email
 * @param {String} org_id
 * @param {String} slug
 * @returns {boolean}
 */
export const userExistInOrgTeam = async (email, org_id, slug) => {
    let result;
    const { teams = null } = Org.findOne({ _id: org_id }, "teams");

    if (teams) {
        const { members } = teams.filter((item) => item.id == slug);
        console.log(members);
    }

    return result;
};

/**
 *
 * @param {String} slug
 * @returns {{status: String, id: String, teams: [], members: []}}
 */
export const findOrgBySlug = async (slug) => {
    if (!slug) return false;
    const org = await Org.findOne({ slug }, "teams members");
    const { success, fail } = flags;

    const teams = org?.teams;
    const members = org?.members;

    if (!teams || !members) return { success: fail };

    let teams_arr = [];
    let members_arr = [];

    for (let team of teams) teams_arr = [...teams_arr, { id: team.id, slug: team.slug }];
    for (let member of members) members_arr = [...members_arr, { id: member.user_id, email: member.email }];

    return {
        success,
        id: org.id,
        teams: teams_arr,
        members: members_arr,
    };
};

/**
 *
 * @param {[]} teams
 * @param {String} slug
 * @returns {boolean}
 */
export const findTeamInOrgBySlug = async (teams, slug) => {
    let result = false;
    teams.filter((team) => (result = team.slug == slug));
    console.log(result, "from utli");

    return result;
};

/**
 *
 * @param {String} token
 * @returns {object}
 */
export const extractTokenData = (bearer) => {
    const base64Url = bearer.split(".")[1];
    const base64 = base64Url.replace("-", "+").replace("_", "/");

    if (!base64) return { error: "invalid token" };

    return JSON.parse(atob(base64));
};

export const findUserInOrgByEmail = async (email) => {};

export const findUserInTeamByEmail = async (tean, email) => {};

/**
 *
 * @param {String | null} prefix
 * @param {String} str
 * @param {String | null} separator
 * @param {Boolean} email
 * @returns Boolean
 *
 * @description filters the string either if it's an email conatains a prefix at the beginning that is separated by a dot.
 */
export const hasPrefix = (prefix, str, separator = null, email = false) => {
    if (typeof str != "string") return false;
    let pattern = !email ? "^[prefix]+separator[\\w-.]{2,16}$" : "^[prefix]+separator[\\w-.]+@([\\w-]+.)+[\\w-]{2,4}$";
    pattern = pattern.replace("separator", separator || "");
    pattern = pattern.replace("[prefix]+", prefix ? `[${prefix}]+` : "");
    const regex = new RegExp(pattern);

    const result = regex.test(str);
    console.log(result, str, pattern, regex);
    return result;
};

export const isEmailValid = (str, prefix) => {
    if (!str || typeof str != "string") return;
};

/**
 *
 * @param {object} res
 * @param {number} status_code
 * @param {Boolean} flag
 * @param {object} payload
 * @param {object | null} headers
 * @returns {object}
 *
 * @author *
 */
export const responseHandler = (res, status_code, flag, payload, headers = null) => {
    res.status(status_code);

    if (headers && typeof headers == "object") {
        const header_props = Object.entries(headers);
        for (let prop of header_props) {
            res.set(prop[0], prop[1]);
        }
    }

    return res.json({ success: flag, ...payload });
};
