import mongoose, { Schema, Document, Types } from "mongoose";


export interface ICustomer extends Document {
  fullName: string;
  email: string;
  phone: string;
  status: string
}

const customerSchema = new mongoose.Schema<ICustomer>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    status : {type: String, required : true},
  },
  { timestamps: true }
);


export const Customer =mongoose.model<ICustomer>("Customer", customerSchema);