import { NextResponse, type NextRequest } from 'next/server';
import ExcelJS from 'exceljs';
import connectDB from '@/lib/db';
import Quote from '@/models/Quote';
import { AuthError, requireSuperAdmin } from '@/lib/auth';
import { formatFreezeDryerDetails } from '@/lib/freezeDryerDetails';

// Admin only: export quote requests as an Excel sheet, optionally filtered by a createdAt date range
export async function GET(req: NextRequest) {
  try {
    requireSuperAdmin(req);
    await connectDB();

    const from = req.nextUrl.searchParams.get('from');
    const to = req.nextUrl.searchParams.get('to');
    const createdAt: { $gte?: Date; $lte?: Date } = {};
    if (from) createdAt.$gte = new Date(`${from}T00:00:00.000Z`);
    if (to) createdAt.$lte = new Date(`${to}T23:59:59.999Z`);

    const filter = Object.keys(createdAt).length > 0 ? { createdAt } : {};
    const quotes = await Quote.find(filter).sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Submissions');

    sheet.columns = [
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Product', key: 'product', width: 30 },
      { header: 'Selections', key: 'selections', width: 40 },
      { header: 'First Name', key: 'firstName', width: 16 },
      { header: 'Last Name', key: 'lastName', width: 16 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Phone', key: 'phone', width: 18 },
      { header: 'Street Address', key: 'streetAddress', width: 28 },
      { header: 'Town/City', key: 'city', width: 18 },
      { header: 'State', key: 'state', width: 16 },
      { header: 'Pincode', key: 'pincode', width: 12 },
      { header: 'Company Name', key: 'companyName', width: 24 },
      { header: 'Role', key: 'role', width: 18 },
      { header: 'Freeze Dryer Requirements', key: 'freezeDryerDetails', width: 50 },
    ];
    sheet.getRow(1).font = { bold: true };

    for (const quote of quotes) {
      sheet.addRow({
        date: quote.createdAt.toLocaleString(),
        product: quote.productName,
        selections: quote.selections.map((s) => `${s.group}: ${s.option}`).join(', '),
        firstName: quote.firstName,
        lastName: quote.lastName,
        email: quote.email,
        phone: quote.phone,
        streetAddress: quote.streetAddress,
        city: quote.city,
        state: quote.state,
        pincode: quote.pincode,
        companyName: quote.companyName,
        role: quote.role,
        freezeDryerDetails: formatFreezeDryerDetails(quote.freezeDryerDetails).replace(/\n/g, '; '),
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="submissions.xlsx"',
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    throw err;
  }
}
