import mongoose from "mongoose";
import main from "../Config/dbConnect.js";
import { subschema_ticket, subschema_presets, subschema_team, subschema_members } from "./subschema.js";

const conn = main();
conn.catch((err) => console.log(err));

const { Schema, model } = mongoose;

const userSchema = new Schema({
    user_first_name: { type: String },
    user_last_name: { type: String },
    user_privilege: { type: String },
    profile_status: { type: String },
    blocked: { type: Boolean },
    user_credentials: {
        email: { type: String, required: true, unique: true },
        username: { type: String },
        password: { type: String, required: true },
        secret: { type: String, required: true },
    },
    user_properties: {
        org_id: { type: String },
        role_id: { type: String },
        team_id: { type: String },
    },
});

const orgSchema = new Schema({
    name: { type: String },
    teams: [{ type: subschema_team }],
    slug: { type: String, unique: true },
    manager_access: {
        email: { type: String },
        login_id: { type: String },
        password: { type: String },
        secret: { type: String },
        updated_at: { type: Date, required: true },
    },
    members: [{ type: subschema_members }],
    tickets: [{ type: subschema_ticket }],
    presets: [{ type: subschema_presets }],
    profile_completed: { type: Boolean, default: 0 },
    verified: { type: Boolean, required: true, default: false },
    created_at: { type: Date, required: true },
});

const User = model("Users", userSchema);
const Org = model("Org", orgSchema);

export { User, Org };
``;
