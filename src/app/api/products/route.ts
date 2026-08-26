import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { AuthError, requireSuperAdmin } from '@/lib/auth';
import { cleanImages, cleanTabs, cleanVariationGroups } from '@/lib/productSanitize';

// Public: list all products (Shop page)
export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (err) {
    console.error('GET /api/products failed:', err);
    return NextResponse.json(
      { message: 'Database connection failed', detail: (err as Error).message },
      { status: 503 }
    );
  }
}

// superAdmin only: create product
export async function POST(req: NextRequest) {
  try {
    requireSuperAdmin(req);
    await connectDB();
    const { name, sku, description, imageUrl, images, brochureUrl, variationGroups, tabs } = await req.json();

    if (!name) {
      return NextResponse.json({ message: 'name is required' }, { status: 400 });
    }

    const product = await Product.create({
      name,
      sku,
      description,
      imageUrl,
      images: cleanImages(images),
      brochureUrl: typeof brochureUrl === 'string' ? brochureUrl.trim() : '',
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
