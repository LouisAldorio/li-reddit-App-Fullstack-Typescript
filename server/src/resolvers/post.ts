import { Post } from "../entities/Post";
import { Context } from "src/types";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {

    @Query(() => [Post])
    posts(
        @Ctx() ctx : Context
    ) : Promise<Post[]> {
        return ctx.em.find(Post, {});
    }

    @Query(() => Post, { nullable: true })
    post(
        @Ctx() ctx : Context,
        @Arg("id", () => Int) id : number
    ) : Promise<Post | null> {
        return ctx.em.findOne(Post, {id: id});
    }

    @Mutation(() => Post)
    async createPost(
        @Ctx() ctx : Context,
        @Arg("title", () => String) title : string
    ) : Promise<Post> {
        const post = ctx.em.create(Post, {title: title});
        await ctx.em.persistAndFlush(post);
        return post;
    }

    @Mutation(() => Post)
    async updatePost(
        @Ctx() ctx : Context,
        @Arg("id", () => Int) id : number,
        @Arg("title", () => String, { nullable: true }) title : string
    ) : Promise<Post> {

        const post = await ctx.em.findOne(Post, {id: id});
        if (!post) {
            throw new Error("Post not found");
        }

        if(typeof title !== "undefined") {
            post.title = title;
            await ctx.em.persistAndFlush(post);
        }
        
        return post;
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Ctx() ctx : Context,
        @Arg("id", () => Int) id : number,
    ) : Promise<boolean> {

        await ctx.em.nativeDelete(Post, {id: id});
        return true;
    }
}