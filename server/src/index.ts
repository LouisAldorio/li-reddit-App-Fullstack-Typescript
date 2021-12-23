import "reflect-metadata";
import { MikroORM } from '@mikro-orm/core'
import { __prod__ } from './constants'
import mikroConfig from './mikro-orm.config'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import { UserResolver } from "./resolvers/user";

import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis'
import { Context } from "./types";

declare module 'express-session' {
    export interface SessionData {
      userId:  number;
    }
  }


const main = async () => {
    const orm = await MikroORM.init(mikroConfig)

    await orm.getMigrator().up()

    // create object instance
    // const post = orm.em.create(Post, {title: 'Hello World'})

    // insert to DB
    // await orm.em.persistAndFlush(post)

    // another way to insert db
    // await orm.em.nativeInsert(Post, {title: 'Hello World 2'})

    // const posts = await orm.em.find(Post, {})
    // console.log(posts)

    const app = express()

    const RedisStore = connectRedis(session)
    const redisClient = new Redis("redis://:password@localhost:6379");

    app.use(
        session({
            name: 'qid',
            store: new RedisStore({ 
                client: redisClient,
                disableTouch: true
             }),
            saveUninitialized: false,
            secret: "asdasdasdqweqweqwe",
            resave: false,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 0.5, // 10 years
                httpOnly: true,
                secure: __prod__,
                sameSite: 'lax' // csrf
            },
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            validate: false,
            resolvers: [HelloResolver, PostResolver, UserResolver]
        }),
        context: ({ req,res }) : Context  => ({ em: orm.em, req, res })
    })

    await apolloServer.start()
    apolloServer.applyMiddleware({ app })

    app.listen(4000, () => {
        console.log('Server listening on port 4000')
    })
}



main().catch(err => console.error(err))