import { Options } from "@mikro-orm/core";
import path from "path";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";

const config : Options = {
    entities: [Post],
    dbName: "lireddit",
    type: "postgresql", // one of `mongo` | `mysql` | `mariadb` | `postgresql` | `sqlite`
    debug: !__prod__,
    password: "password",
    user: "postgres",
    migrations: {
        path: path.join(__dirname,'./migrations'), // path to the folder with migrations
        pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
    }
};

export default config;
