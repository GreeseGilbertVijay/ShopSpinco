import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface QuoteSelection {
  group: string;
  option: string;
}

export interface FreezeDryerDetails {
  organizationSegment: string[];
  primaryApplication: string[];
  sampleProductType: string[];
  intendedPurpose: string[];
  currentSetup: string[];
  expectedUsage: string[];
  purchaseTimeline: string[];
  primaryApplicationField: string[];
  comments: string;
}

export interface IQuote extends Document {
  product: mongoose.Types.ObjectId;
  productName: string;
  selections: QuoteSelection[];
  freezeDryerDetails?: FreezeDryerDetails;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
  companyName: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const freezeDryerDetailsSchema = new Schema<FreezeDryerDetails>(
  {
    organizationSegment: { type: [String], default: [] },
    primaryApplication: { type: [String], default: [] },
    sampleProductType: { type: [String], default: [] },
    intendedPurpose: { type: [String], default: [] },
    currentSetup: { type: [String], default: [] },
    expectedUsage: { type: [String], default: [] },
    purchaseTimeline: { type: [String], default: [] },
    primaryApplicationField: { type: [String], default: [] },
    comments: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const quoteSchema = new Schema<IQuote>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    selections: [
      {
        group: String,
        option: String,
        _id: false,
      },
    ],
    freezeDryerDetails: { type: freezeDryerDetailsSchema, default: undefined },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, default: '', trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, match: /^\d{10}$/ },
    streetAddress: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true, match: /^\d{6}$/ },
    companyName: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default (mongoose.models.Quote as Model<IQuote>) || mongoose.model<IQuote>('Quote', quoteSchema);
