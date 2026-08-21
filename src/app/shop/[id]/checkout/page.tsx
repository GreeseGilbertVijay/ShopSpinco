import CheckoutClient from './checkout-client';

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CheckoutClient id={id} />;
}
