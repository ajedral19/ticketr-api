import { flags } from "../../constants.js";
import { Org } from "../../Schema/ticketr.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { generate as generateSecret } from "../../Utils/secret.util.js";
import { findOrgBySlug, hasPrefix, responseHandler } from "../../Utils/util.js";
import { sendMail } from "../../Utils/mailer.util.js";

export const Register = async (req, res, next) => {
    const { success, fail } = flags;
    const { company_name = "", slug = "" } = req.body;
    let status_code,
        error_message,
        has_error = false,
        headers = null,
        payload = {};

    if (!company_name || !slug) {
        status_code = 400;
        has_error = true;
        error_message = "all fields must be filled in.";
    }

    const { success: org_exist } = await findOrgBySlug(slug);
    if (org_exist && !has_error) {
        status_code = 400;
        has_error = true;
        error_message = "slug is already taken.";
    }

    if (!has_error) {
        try {
            const secret = generateSecret();
            const date = new Date();
            await Org.create({
                name: company_name,
                slug,
                manager_access: { secret, updated_at: date },
                created_at: date,
            }).then(({ id, name, slug, manager_access, created_at }) => {
                const token = jwt.sign({ id }, manager_access.secret);
                status_code = 200;

                headers = {
                    Authorization: `Bearer ${token}`,
                    Organization: name,
                    "Organization-prefix": slug,
                    "User-type": "Admin",
                };

                payload = {
                    company_name: name,
                    company_prefix: slug,
                    path: `/${slug}`,
                    created_at,
                };
            });
        } catch (err) {
            has_error = true;
            status_code = 500;
            error_message = err.message;
        }
    }

    if (has_error) return responseHandler(res, status_code, fail, { message: error_message || "N/A" }, null);
    return responseHandler(res, status_code, success, payload, headers);
};

export const RegisterCredentials = async (req, res, next) => {
    const { email = "", login_id = "", password = "", confirm_password = "" } = req.body;
    const { org: slug = "" } = req.params;

    const { success, fail } = flags;
    let status_code,
        error_message,
        has_error = false,
        headers = null,
        payload = {};

    if (!email || !login_id || !password || !confirm_password) {
        status_code = 400;
        has_error = true;
        error_message = "incomplete form";
    }

    if (password !== confirm_password && !has_error) {
        status_code = 400;
        has_error = true;
        error_message = "password did not match";
    }

    if (!has_error) {
        try {
            const org = await Org.findOne({ slug }, "slug profile_completed");

            if (!org) {
                status_code = 400;
                has_error = true;
                error_message = "the org you're trying to access does not exists";
            }

            if (org.profile_completed && !has_error) {
                status_code = 403;
                has_error = true;
                error_message = "unauthorized attempt";
            }

            if (!has_error) {
                const email_valid = hasPrefix(org.slug, email, "_", true);
                const login_id_valid = hasPrefix(org.slug, login_id, "\\.");
                if (!email_valid && !has_error) {
                    status_code = 400;
                    has_error = true;
                    error_message = "invalid email. email must contain the company's prefix at the begenning";
                }

                if (!login_id_valid && !has_error) {
                    status_code = 400;
                    has_error = true;
                    error_message = "invalid login id. login id must contain the company's prefix at the begenning";
                }

                if (!has_error) {
                    const hashed = await bcrypt.hash(password, 10);
                    const secret = generateSecret();
                    await Org.findOneAndUpdate(
                        { slug },
                        {
                            profile_completed: true,
                            manager_access: {
                                email,
                                login_id,
                                password: hashed,
                                secret,
                            },
                        },
                        { self: true, upsert: true, new: true }
                    ).then((result) => {
                        if (!result.verified) {
                            const verification_url = "this is some url";

                            payload = {
                                message: "check your email to verify the account",
                                resend: "http://localhost:9200/verify/resend",
                            };

                            sendMail(verification_url, "no-reply - ticketr email verification", result.manager_access.email);
                            console.log(result.verified);
                        }
                    });
                    status_code = 200;
                }
            }
        } catch (err) {
            has_error = true;
            status_code = 500;
            error_message = err.message;
        }
    }

    if (has_error) return responseHandler(res, status_code, fail, { message: error_message || "N/A" }, null);
    return responseHandler(res, status_code, success, payload, headers);
};

export const VerifyRegistration = async (req, res, next) => {
    return res.status(200).set("Authorization", "123Auth").redirect("http://localhost:9200/org/admin/");
};
