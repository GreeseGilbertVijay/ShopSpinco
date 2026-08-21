import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { AuthError, requireSuperAdmin } from '@/lib/auth';
import { cleanImages, cleanTabs, cleanVariationGroups } from '@/lib/productSanitize';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Public: get one product
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  await connectDB();
  const product = await Product.findById(id);
  if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  return NextResponse.json(product);
}

// superAdmin only: update product
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    requireSuperAdmin(req);
    const { id } = await params;
    await connectDB();
    const { name, sku, description, imageUrl, images, variationGroups, tabs } = await req.json();

    if (!name) {
      return NextResponse.json({ message: 'name is required' }, { status: 400 });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        sku,
        description,
        imageUrl,
        images: cleanImages(images),
        variationGroups: cleanVariationGroups(variationGroups),
        tabs: cleanTabs(tabs),
      },
      { new: true, runValidators: true }
    );
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    throw err;
  }
}

// superAdmin only: delete product
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    requireSuperAdmin(req);
    const { id } = await params;
    await connectDB();
    const product = await Product.findByIdAndDelete(id);
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    return NextResponse.json({ message: 'Product deleted' });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    throw err;
  }
}
