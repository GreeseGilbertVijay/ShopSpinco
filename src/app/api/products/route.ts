import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { AuthError, requireSuperAdmin } from '@/lib/auth';
import { cleanImages, cleanTabs, cleanVariationGroups } from '@/lib/productSanitize';

// Public: list all products (Shop page)
export async function GET() {
  await connectDB();
  const products = await Product.find().sort({ createdAt: -1 });
  return NextResponse.json(products);
}

// superAdmin only: create product
export async function POST(req: NextRequest) {
  try {
    requireSuperAdmin(req);
    await connectDB();
    const { name, sku, description, imageUrl, images, variationGroups, tabs } = await req.json();

    if (!name) {
      return NextResponse.json({ message: 'name is required' }, { status: 400 });
    }

    const product = await Product.create({
      name,
      sku,
      description,
      imageUrl,
      images: cleanImages(images),
      variationGroups: cleanVariationGroups(variationGroups),
      tabs: cleanTabs(tabs),
    });
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    throw err;
  }
}
