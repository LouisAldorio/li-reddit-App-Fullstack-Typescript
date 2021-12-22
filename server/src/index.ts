import { MikroORM } from '@mikro-orm/core'
import { __prod__ } from './constants'
import { Post } from './entities/Post'
import mikroConfig from './mikro-orm.config'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'

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
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            validate: false,
            resolvers: [HelloResolver, PostResolver]
        }),
        context: () => ({ em: orm.em })
    })

    await apolloServer.start()
    apolloServer.applyMiddleware({ app })

    app.listen(4000, () => {
        console.log('Server listening on port 4000')
    })
}



main().catch(err => console.error(err))