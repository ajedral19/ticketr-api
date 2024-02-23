import { flags } from "../../constants.js";
import { Org } from "../../Schema/ticketr.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { hasPrefix, responseHandler } from "../../Utils/util.js";

export const Login = async (req, res, next) => {
    const { login_id = "", password = "" } = req.body;
    const { success, fail } = flags;
    let status_code,
        error_message,
        has_error = false,
        headers = null,
        payload = {};

    if (!login_id || !password) {
        status_code = 400;
        has_error = true;
        error_message = "invalid login_id or password";
    }

    const login_id_email = hasPrefix("", login_id, null, true);
    const login_id_username = hasPrefix("", login_id, null);
    const property = login_id_email ? "email" : login_id_username ? "login_id" : "login_id";
    console.log(login_id_email, login_id_username);

    if (!has_error) {
        try {
            console.log(property);
            const org = await Org.findOne({ [`manager_access.${property}`]: login_id }, "slug name created_at verified manager_access");
            if (!org && !has_error) {
                status_code = 400;
                has_error = true;
                error_message = `invalid credential ${login_id}`;
            }

            if (!has_error) {
                const { manager_access, slug, name, created_at, verified } = org;
                const { password: hashed, secret } = manager_access;
                const password_matched = await bcrypt.compare(password, hashed);

                if (!password_matched) {
                    status_code = 400;
                    has_error = true;
                    error_message = "incorrect password";
                }

                if (!verified && !has_error) {
                    status_code = 400;
                    has_error = true;
                    error_message = "acount is not verified yet";
                }

                if (!has_error) {
                    const token = jwt.sign(payload, secret, { expiresIn: "1h" });

                    status_code = 200;
                    headers = {
                        Authorization: `Bearer ${token}`,
                        Organization: name,
                        "Organization-prefix": slug,
                        "Uset-type": "Admin",
                    };
                    payload = {
                        slug,
                        name,
                        created_at,
                    };
                }
            }
        } catch (err) {
            if (!has_error) {
                has_error = true;
                status_code = 500;
                error_message = err.message;
            }
        }
    }

    if (has_error) return responseHandler(res, status_code, fail, { message: error_message || "N/A" }, null);
    return responseHandler(res, status_code, success, payload, headers);
};
