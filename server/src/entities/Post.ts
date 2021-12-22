import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType, GraphQLISODateTime } from "type-graphql";

// change class to graphql type
@ObjectType()
@Entity()
export class Post {

    // expose property to graphql schema with @Field
    @Field(() => Int)
    @PrimaryKey()
    id!: number;

    @Field(() => GraphQLISODateTime)
    @Property({ type: 'date' })
    createdAt = new Date();

    @Field(() => GraphQLISODateTime)
    @Property({ type: 'date', onUpdate: () => new Date() })
    updatedAt = new Date();

    @Field(() => String)
    @Property({
        type: "text",
    })
    title!: string;
}