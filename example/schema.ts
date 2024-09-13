import { z } from "zod";
import type { Json } from "./types";

export const JsonSchema: z.ZodSchema<Json> = z.lazy(() =>
  z
    .union([
      z.string(),
      z.number(),
      z.boolean(),
      z.record(JsonSchema),
      z.array(JsonSchema),
    ])
    .nullable(),
);

export const ChannelsRowSchema = z.object({
  id: z.number(),
  data: JsonSchema.nullable(),
  slug: z.string().nullable(),
});

export const ChannelsInsertSchema = z.object({
  id: z.number().optional(),
  data: JsonSchema.optional().nullable(),
  slug: z.string().optional().nullable(),
});

export const ChannelsUpdateSchema = z.object({
  id: z.number().optional(),
  data: JsonSchema.optional().nullable(),
  slug: z.string().optional().nullable(),
});

export const MessagesRowSchema = z.object({
  id: z.number(),
  data: JsonSchema.nullable(),
  message: z.string().nullable(),
  username: z.string(),
  channel_id: z.number(),
});

export const MessagesInsertSchema = z.object({
  id: z.number().optional(),
  data: JsonSchema.optional().nullable(),
  message: z.string().optional().nullable(),
  username: z.string(),
  channel_id: z.number(),
});

export const MessagesUpdateSchema = z.object({
  id: z.number().optional(),
  data: JsonSchema.optional().nullable(),
  message: z.string().optional().nullable(),
  username: z.string().optional(),
  channel_id: z.number().optional(),
});

export const ShopsRowSchema = z.object({
  id: z.number(),
  address: z.string().nullable(),
  shop_geom: z.unknown().nullable(),
});

export const ShopsInsertSchema = z.object({
  id: z.number(),
  address: z.string().optional().nullable(),
  shop_geom: z.unknown().optional().nullable(),
});

export const ShopsUpdateSchema = z.object({
  id: z.number().optional(),
  address: z.string().optional().nullable(),
  shop_geom: z.unknown().optional().nullable(),
});

export const UserStatusSchema = z.union([
  z.literal("ONLINE"),
  z.literal("OFFLINE"),
]);

export const UsersInsertSchema = z.object({
  username: z.string(),
  data: JsonSchema.optional().nullable(),
  age_range: z.unknown().optional().nullable(),
  catchphrase: z.unknown().optional().nullable(),
  status: UserStatusSchema.optional().nullable(),
});

export const UsersUpdateSchema = z.object({
  username: z.string().optional(),
  data: JsonSchema.optional().nullable(),
  age_range: z.unknown().optional().nullable(),
  catchphrase: z.unknown().optional().nullable(),
  status: UserStatusSchema.optional().nullable(),
});

export const NonUpdatableViewRowSchema = z.object({
  username: z.string().nullable(),
});

export const UpdatableViewRowSchema = z.object({
  username: z.string().nullable(),
  non_updatable_column: z.number().nullable(),
});

export const UpdatableViewInsertSchema = z.object({
  username: z.string().optional().nullable(),
  non_updatable_column: z.never().optional(),
});

export const UpdatableViewUpdateSchema = z.object({
  username: z.string().optional().nullable(),
  non_updatable_column: z.never().optional(),
});

export const UsersRowSchema = z.object({
  username: z.string(),
  data: JsonSchema.nullable(),
  age_range: z.unknown().nullable(),
  catchphrase: z.unknown().nullable(),
  status: UserStatusSchema.nullable(),
});

export type ChannelsRow = z.infer<typeof ChannelsRowSchema>;
export type ChannelsInsert = z.infer<typeof ChannelsInsertSchema>;
export type ChannelsUpdate = z.infer<typeof ChannelsUpdateSchema>;
export type MessagesRow = z.infer<typeof MessagesRowSchema>;
export type MessagesInsert = z.infer<typeof MessagesInsertSchema>;
export type MessagesUpdate = z.infer<typeof MessagesUpdateSchema>;
export type ShopsRow = z.infer<typeof ShopsRowSchema>;
export type ShopsInsert = z.infer<typeof ShopsInsertSchema>;
export type ShopsUpdate = z.infer<typeof ShopsUpdateSchema>;
export type UserStatus = z.infer<typeof UserStatusSchema>;
export type UsersInsert = z.infer<typeof UsersInsertSchema>;
export type UsersUpdate = z.infer<typeof UsersUpdateSchema>;
export type UsersRow = z.infer<typeof UsersRowSchema>;
export type NonUpdatableViewRow = z.infer<typeof NonUpdatableViewRowSchema>;
export type UpdatableViewRow = z.infer<typeof UpdatableViewRowSchema>;
export type UpdatableViewInsert = z.infer<typeof UpdatableViewInsertSchema>;
export type UpdatableViewUpdate = z.infer<typeof UpdatableViewUpdateSchema>;

export type Channels = {
  Row: ChannelsRow;
  Insert: ChannelsInsert;
  Update: ChannelsUpdate;
};

export const ChannelsSchema = {
  Row: ChannelsRowSchema,
  Insert: ChannelsInsertSchema,
  Update: ChannelsUpdateSchema,
};

export type Messages = {
  Row: MessagesRow;
  Insert: MessagesInsert;
  Update: MessagesUpdate;
};

export const MessagesSchema = {
  Row: MessagesRowSchema,
  Insert: MessagesInsertSchema,
  Update: MessagesUpdateSchema,
};

export type Shops = {
  Row: ShopsRow;
  Insert: ShopsInsert;
  Update: ShopsUpdate;
};

export const ShopsSchema = {
  Row: ShopsRowSchema,
  Insert: ShopsInsertSchema,
  Update: ShopsUpdateSchema,
};

export type Users = {
  Insert: UsersInsert;
  Update: UsersUpdate;
  Row: UsersRow;
};

export const UsersSchema = {
  Insert: UsersInsertSchema,
  Update: UsersUpdateSchema,
  Row: UsersRowSchema,
};

export type UpdatableView = {
  Row: UpdatableViewRow;
  Insert: UpdatableViewInsert;
  Update: UpdatableViewUpdate;
};

export const UpdatableViewSchema = {
  Row: UpdatableViewRowSchema,
  Insert: UpdatableViewInsertSchema,
  Update: UpdatableViewUpdateSchema,
};
