import { config } from "dotenv";

const env = config().parsed;
const DBConn = env?.MONGODB;

import mongoose from "mongoose";

export default async function main() {
    const uri = DBConn;

    mongoose.connection
        .on("open", () => console.log("database state", "connection open"))
        .on("close", () => console.log("database state", "connection open"))
        .on("error", () => console.log("database state", error));

    await mongoose.connect(uri);

}
