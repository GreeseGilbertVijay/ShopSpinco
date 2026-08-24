import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Quote from '@/models/Quote';
import Product from '@/models/Product';
import { AuthError, requireSuperAdmin } from '@/lib/auth';
import { sendMail, describeMailError } from '@/lib/mail';
import { generateInvoicePdf } from '@/lib/invoice';
import { cleanFreezeDryerDetails, formatFreezeDryerDetails } from '@/lib/freezeDryerDetails';

// Public: submit a quote request
export async function POST(req: NextRequest) {
  await connectDB();
  const {
    productId,
    selections,
    firstName,
    lastName,
    email,
    phone,
    streetAddress,
    city,
    state,
    pincode,
    companyName,
    role,
    freezeDryerDetails,
  } = await req.json();

  if (
    !productId ||
    !firstName ||
    !email ||
    !phone ||
    !streetAddress ||
    !city ||
    !state ||
    !pincode ||
    !companyName ||
    !role
  ) {
    return NextResponse.json(
      {
        message:
          'productId, firstName, email, phone, streetAddress, city, state, pincode, companyName and role are required',
      },
      { status: 400 }
    );
  }

  if (!/^\d{10}$/.test(phone)) {
    return NextResponse.json({ message: 'phone must be exactly 10 digits' }, { status: 400 });
  }

  if (!/^\d{6}$/.test(pincode)) {
    return NextResponse.json({ message: 'pincode must be exactly 6 digits' }, { status: 400 });
  }

  const product = await Product.findById(productId);
  if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

  // Validate selections against the stored product so a tampered client payload can't add options that don't exist
  const requested = Array.isArray(selections) ? selections : [];
  const resolvedSelections = requested
    .map(({ group, option }: { group: string; option: string }) => {
      const matchedGroup = product.variationGroups.find((g) => g.name === group);
      const matchedOption = matchedGroup?.options.find((o) => o.label === option);
      if (!matchedOption) return null;
      return { group, option };
    })
    .filter((s): s is { group: string; option: string } => s !== null);

  const customer = { firstName, lastName, email, phone, streetAddress, city, state, pincode, companyName, role };
  const cleanedFreezeDryerDetails = cleanFreezeDryerDetails(freezeDryerDetails);

  const quote = await Quote.create({
    product: product._id,
    productName: product.name,
    selections: resolvedSelections,
    freezeDryerDetails: cleanedFreezeDryerDetails,
    ...customer,
  });

  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  // Email delivery is best-effort: a broken/unconfigured SMTP setup shouldn't stop the
  // customer's quote request from going through, since it's already saved above.
  try {
    const pdfBuffer = await generateInvoicePdf({
      quoteId: quote._id.toString(),
      productName: product.name,
      selections: resolvedSelections,
      customer,
      freezeDryerDetails: cleanedFreezeDryerDetails,
    });
    const attachments = [{ filename: `quote-${quote._id}.pdf`, content: pdfBuffer }];
    const freezeDryerText = formatFreezeDryerDetails(cleanedFreezeDryerDetails);

    await Promise.all([
      sendMail({
        to: process.env.ADMIN_EMAIL,
        subject: `New quote request: ${product.name}`,
        text: `New quote request from ${fullName} (${[email, phone, companyName].filter(Boolean).join(', ')}) for ${product.name}.\n\nSelections:\n${resolvedSelections.map((s) => `${s.group}: ${s.option}`).join('\n')}${freezeDryerText ? `\n\nFreeze Dryer Requirements:\n${freezeDryerText}` : ''}`,
        attachments,
      }),
      sendMail({
        to: email,
        subject: `Your quote request for ${product.name}`,
        text: `Hi ${firstName},\n\nThanks for your quote request for ${product.name}. We've attached a summary of your request and will follow up shortly with pricing and availability.`,
        attachments,
      }),
    ]);
  } catch (err) {
    console.error('Quote email delivery failed:', describeMailError(err));
  }

  return NextResponse.json(quote, { status: 201 });
}

// Admin only: list quote requests
export async function GET(req: NextRequest) {
  try {
    requireSuperAdmin(req);
    await connectDB();
    const quotes = await Quote.find().sort({ createdAt: -1 });
    return NextResponse.json(quotes);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    throw err;
  }
}
