import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { compare, genSalt, hash } from 'bcrypt';

const SALT_WORK_FACTORY = 10;

export interface UserMethods {
  checkPassword(password: string): Promise<boolean>;
  generateToken(): void;
}

@Schema()
export class User {
  @Prop({
    required: true,
    unique: true,
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  token: string;

  @Prop({
    required: true,
    enum: ['user', 'admin'],
    default: 'user',
  })
  role: string;

  @Prop()
  displayName: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.generateToken = function () {
  this.token = crypto.randomUUID();
};

UserSchema.methods.checkPassword = function (password: string) {
  return compare(password, this.password);
};

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await genSalt(SALT_WORK_FACTORY);
  this.password = await hash(this.password, salt);
});

UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export type UserDocument = User & Document & UserMethods;
