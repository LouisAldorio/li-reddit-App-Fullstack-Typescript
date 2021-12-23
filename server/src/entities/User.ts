import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType, GraphQLISODateTime } from "type-graphql";

// change class to graphql type
@ObjectType()
@Entity()
export class User {

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
        unique: true,
    })
    username!: string;

    @Property({
        type: "text",
    })
    password!: string;
}