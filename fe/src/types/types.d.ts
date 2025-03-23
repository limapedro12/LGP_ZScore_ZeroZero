import { Types } from 'mongoose';

/**
 * Module Types
 * **/
export type ObjectId = undefined | Types.ObjectId;

export type User = {
    id: number;
    name: string;
    email: string;
  };
