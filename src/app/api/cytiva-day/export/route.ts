import { NextResponse, type NextRequest } from 'next/server';
import ExcelJS from 'exceljs';
import connectDB from '@/lib/db';
import CytivaDayEntry from '@/models/CytivaDayEntry';
import { AuthError, requireSuperAdmin } from '@/lib/auth';
import { CYTIVA_DAY_QUESTIONS } from '@/lib/cytivaDayQuiz';

// Admin only: export Cytiva Day quiz submissions and the leaderboard as an Excel workbook
export async function GET(req: NextRequest) {
  try {
    requireSuperAdmin(req);
    await connectDB();

    const entries = await CytivaDayEntry.find().sort({ startedAt: -1 });
    const leaderboard = entries
      .filter((e) => e.status === 'completed')
      .slice()
      .sort((a, b) => b.totalScore - a.totalScore || a.totalTimeSeconds - b.totalTimeSeconds);

    const workbook = new ExcelJS.Workbook();

    const submissionsSheet = workbook.addWorksheet('Submissions');
    submissionsSheet.columns = [
      { header: 'Name', key: 'name', width: 24 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Progress', key: 'progress', width: 14 },
      { header: 'Score', key: 'score', width: 10 },
      { header: 'Total Time (s)', key: 'time', width: 16 },
      { header: 'Started', key: 'started', width: 22 },
      { header: 'Completed', key: 'completed', width: 22 },
    ];
    submissionsSheet.getRow(1).font = { bold: true };
    for (const entry of entries) {
      submissionsSheet.addRow({
        name: entry.name,
        status: entry.status === 'completed' ? 'Completed' : 'In progress',
        progress: `${entry.status === 'completed' ? CYTIVA_DAY_QUESTIONS.length : entry.answers.length} / ${CYTIVA_DAY_QUESTIONS.length}`,
        score: entry.totalScore,
        time: entry.totalTimeSeconds,
        started: entry.startedAt.toLocaleString(),
        completed: entry.completedAt ? entry.completedAt.toLocaleString() : '',
      });
    }

    const leaderboardSheet = workbook.addWorksheet('Leaderboard');
    leaderboardSheet.columns = [
      { header: 'Rank', key: 'rank', width: 8 },
      { header: 'Name', key: 'name', width: 24 },
      { header: 'Score', key: 'score', width: 10 },
      { header: 'Total Time (s)', key: 'time', width: 16 },
      { header: 'Completed', key: 'completed', width: 22 },
    ];
    leaderboardSheet.getRow(1).font = { bold: true };
    leaderboard.forEach((entry, i) => {
      leaderboardSheet.addRow({
        rank: i + 1,
        name: entry.name,
        score: entry.totalScore,
        time: entry.totalTimeSeconds,
        completed: entry.completedAt ? entry.completedAt.toLocaleString() : '',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="cytiva-day.xlsx"',
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    throw err;
  }
}
