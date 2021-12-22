import { Post } from "../entities/Post";
import { Context } from "src/types";
import { Ctx, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {

    @Query(() => [Post])
    posts(
        @Ctx() ctx : Context
    ) : Promise<Post[]> {
        return ctx.em.find(Post, {});
    }
}