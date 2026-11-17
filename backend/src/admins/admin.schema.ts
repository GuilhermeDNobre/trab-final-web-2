import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { hash } from 'bcrypt';
import type { HydratedDocument } from 'mongoose';

const SALT_ROUNDS = 10;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret.password;
      return ret;
    },
  },
})
export class Admin {
  @Prop({ type: String, required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ type: String, required: true, select: false })
  password: string;
}

export type AdminDocument = HydratedDocument<Admin>;
export const AdminSchema = SchemaFactory.createForClass(Admin);

AdminSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await hash(this.password, SALT_ROUNDS);
  }
});
