import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface VariationOption {
  label: string;
  imageUrl: string;
}

export interface VariationGroup {
  name: string;
  options: VariationOption[];
}

export interface ProductTab {
  name: string;
  content: string;
}

export interface IProduct extends Document {
  name: string;
  sku: string;
  description: string;
  imageUrl: string;
  images: string[];
  brochureUrl: string;
  variationGroups: VariationGroup[];
  tabs: ProductTab[];
  createdAt: Date;
  updatedAt: Date;
}

const variationOptionSchema = new Schema<VariationOption>(
  {
    label: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: '' },
  },
  { _id: false }
);

const variationGroupSchema = new Schema<VariationGroup>(
  {
    name: { type: String, required: true, trim: true },
    options: {
      type: [variationOptionSchema],
      validate: (v: VariationOption[]) => Array.isArray(v) && v.length > 0,
    },
  },
  { _id: false }
);

const tabSchema = new Schema<ProductTab>(
  {
    name: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, default: '', trim: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    images: { type: [String], default: [] },
    brochureUrl: { type: String, default: '', trim: true },
    variationGroups: { type: [variationGroupSchema], default: [] },
    tabs: { type: [tabSchema], default: [] },
  },
  { timestamps: true }
);

export default (mongoose.models.Product as Model<IProduct>) ||
  mongoose.model<IProduct>('Product', productSchema);
