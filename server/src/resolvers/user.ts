import { User } from "../entities/User";
import { Context } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from 'argon2'

@InputType()
class UsernamePasswordInput {

    @Field()
    username: string;

    @Field()
    password: string;
}

@ObjectType()
class FieldError {

    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse {

    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}


@Resolver()
export class UserResolver {

    @Query(() => User, { nullable: true })
    async me(@Ctx() ctx: Context) : Promise<User | null> {

        // you are not logged in
        if(!ctx.req.session!.userId) {
            return null
        }

        const user = await ctx.em.findOne(User, {
            id: ctx.req.session!.userId,
        });

        return user
    }
    
    @Mutation(() => UserResponse)
    async register(
        @Ctx() ctx : Context,
        @Arg("input", () => UsernamePasswordInput) input: UsernamePasswordInput
    ) : Promise<UserResponse> {

        if (input.username.length <= 2) {
            return {
                errors: [{
                    field: "username",
                    message: "username length must be greater than 2",
                }],
            }
        }

        if (input.password.length <= 2) {
            return {
                errors: [{
                    field: "password",
                    message: "password length must be greater than 2",
                }],
            }
        }

        const hashedPassword = await argon2.hash(input.password);
        const user = ctx.em.create(User, {
            username: input.username,
            password: hashedPassword,
        });

        try {
            await ctx.em.persistAndFlush(user);
        } catch(err) {
            if (err.code === "23505" || err.detail.includes("already exists")) {
                return {
                    errors: [{
                        field: "username",
                        message: "username already taken",
                    }],
                }
            }
        }

        //make user directly loggin by setting the cookie
        ctx.req.session!.userId = user.id;
        
        return {
            user,
        };
    }

    @Mutation(() => UserResponse)
    async login(
        @Ctx() ctx : Context,
        @Arg("input", () => UsernamePasswordInput) input: UsernamePasswordInput
    ) : Promise<UserResponse> {

        const user = await ctx.em.findOne(User, {
            username: input.username,
        });

        if (!user) {
            return {
                errors: [{
                    field: "username",
                    message: "that username doesn't exist",
                }],
            }
        }

        const valid = await argon2.verify(user.password, input.password);
        if (!valid) {
            return {
                errors: [{
                    field: "password",
                    message: "incorrect password",
                }],
            }
        }

        ctx.req.session!.userId = user.id;

        return {
            user,
        }
    }
}