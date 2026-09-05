import { Schema, model, Document, Types } from "mongoose";
import mongoose from "mongoose";

export interface IPayment extends Document {
  customer: Types.ObjectId; // reference to Customer
  amount : number;
  currency : string;
  status : string;
  failureReason : string;
  provider : string

}

const PaymentSchema = new mongoose.Schema<IPayment>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    amount : {type: Number, required : true},
    currency : {type : String, required : true},
    status : {type : String, required : true},
    failureReason : {type : String, required : false},
    provider : {type : String, required : true}

  },
  { timestamps: true }
);

export const Payment = model<IPayment>("Payment", PaymentSchema);