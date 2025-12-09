import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// Excel 파일 목록 조회
export async function GET() {
  try {
    const excelsDir = path.join(process.cwd(), 'excels');

    // excels 디렉토리가 없으면 빈 배열 반환
    if (!fs.existsSync(excelsDir)) {
      return NextResponse.json({ files: [] });
    }

    const files = fs.readdirSync(excelsDir)
      .filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'))
      .map(file => {
        const filePath = path.join(excelsDir, file);
        const stats = fs.statSync(filePath);

        // 파일명에서 memberId 추출 (예: park.ms_issueList_202512100006.xlsx)
        const match = file.match(/^([^_]+)_issueList_(\d+)\.(xlsx|xls)$/);

        return {
          name: file,
          memberId: match ? match[1] : null,
          timestamp: match ? match[2] : null,
          size: stats.size,
          modifiedAt: stats.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Excel 파일 목록 조회 실패:', error);
    return NextResponse.json(
      { error: 'Excel 파일 목록을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}
