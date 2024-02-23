import { Schema } from "mongoose";

export const subschema_presets = new Schema({
    name: { type: String },
    options: [
        {
            key: { type: String },
            value: { type: String },
        },
    ],
});

// ticket schama subschema
const subschema_ticket_properties = new Schema({
    support: { type: Number },
    status: { type: Number },
    type: { type: Number },
    priority_level: { type: Number },
});

export const subschema_checklist = new Schema({
    id: { type: String },
    item_status: { type: String },
    item_content: { type: String },
});

export const subschema_ticket = new Schema({
    id: { type: String },
    ticket_assignees: [{ type: String }],
    ticket_author: { type: String },
    ticket_description: { type: String },
    ticket_number: { type: String },
    ticket_title: { type: String },
    ticket_properties: { type: subschema_ticket_properties },
    ticket_checklist: [{ type: subschema_checklist }],
    created_at: {type: Date, required: true},
    updated_at: {type: Date, required: true},
});

export const subschema_team = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    members: [
        {
            user_id: { type: String, required: true },
            email: { type: String, required: true },
        },
    ],
});

export const subschema_members = new Schema({
    user_id: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
});
