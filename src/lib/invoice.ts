import PDFDocument from 'pdfkit';
import type { QuoteSelection, FreezeDryerDetails } from '@/models/Quote';

const FREEZE_DRYER_LIST_FIELDS = [
  'organizationSegment',
  'primaryApplication',
  'sampleProductType',
  'intendedPurpose',
  'currentSetup',
  'expectedUsage',
  'purchaseTimeline',
  'primaryApplicationField',
] as const;

export interface InvoiceCustomer {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  companyName?: string;
  role?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface GenerateInvoicePdfOptions {
  quoteId: string;
  productName: string;
  selections: QuoteSelection[];
  customer: InvoiceCustomer;
  freezeDryerDetails?: FreezeDryerDetails;
}

export function generateInvoicePdf({
  quoteId,
  productName,
  selections,
  customer,
  freezeDryerDetails,
}: GenerateInvoicePdfOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('SpincoTech - Quote Request', { align: 'left' });
    doc.moveDown();
    doc.fontSize(10).fillColor('#555').text(`Reference: ${quoteId}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    doc.fillColor('#000').fontSize(14).text('Product');
    doc.fontSize(12).text(productName);
    doc.moveDown();

    if (selections.length > 0) {
      doc.fontSize(14).text('Selected Options');
      doc.fontSize(12);
      for (const s of selections) {
        doc.text(`${s.group}: ${s.option}`);
      }
      doc.moveDown();
    }

    if (freezeDryerDetails) {
      doc.fontSize(14).text('Freeze Dryer Requirements');
      doc.fontSize(12);
      for (const field of FREEZE_DRYER_LIST_FIELDS) {
        const values = freezeDryerDetails[field];
        if (values?.length > 0) {
          doc.text(`${field}: ${values.join(', ')}`);
        }
      }
      if (freezeDryerDetails.comments) {
        doc.text(`comments: ${freezeDryerDetails.comments}`);
      }
      doc.moveDown();
    }

    doc.fontSize(14).text('Customer Details');
    doc.fontSize(12);
    doc.text(`Name: ${[customer.firstName, customer.lastName].filter(Boolean).join(' ')}`);
    doc.text(`Email: ${customer.email}`);
    if (customer.phone) doc.text(`Phone: ${customer.phone}`);
    if (customer.companyName) doc.text(`Company: ${customer.companyName}`);
    if (customer.role) doc.text(`Role: ${customer.role}`);
    const addressLine = [customer.streetAddress, customer.city, customer.state, customer.pincode]
      .filter(Boolean)
      .join(', ');
    if (addressLine) doc.text(`Address: ${addressLine}`);
    doc.moveDown();

    doc
      .fontSize(10)
      .fillColor('#555')
      .text('This is a quote request confirmation, not a priced invoice. Our team will follow up with pricing and availability.');

    doc.end();
  });
}
