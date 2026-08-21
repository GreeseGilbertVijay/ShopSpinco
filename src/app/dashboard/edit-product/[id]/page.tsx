import EditProductClient from './edit-product-client';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditProductClient id={id} />;
}
