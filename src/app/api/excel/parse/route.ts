import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

// Excel 시리얼 날짜를 JS Date로 변환
function excelDateToJSDate(serial: number): Date {
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  return new Date(utcValue * 1000);
}

// IMS 상태를 내부 상태로 매핑
function mapStatus(imsStatus: string): 'new' | 'in_progress' | 'review' | 'completed' | 'on_hold' {
  const status = imsStatus?.toLowerCase() || '';

  if (status.includes('open') || status.includes('new')) return 'new';
  if (status.includes('assigned') || status.includes('progress')) return 'in_progress';
  if (status.includes('review') || status.includes('test')) return 'review';
  if (status.includes('closed') || status.includes('resolved') || status.includes('completed')) return 'completed';
  if (status.includes('reopen')) return 'in_progress';
  if (status.includes('hold') || status.includes('pending')) return 'on_hold';

  return 'new';
}

// 심각도를 우선순위로 매핑
function mapPriority(severity: string): 'urgent' | 'high' | 'medium' | 'low' {
  const sev = severity?.toLowerCase() || '';

  if (sev.includes('critical') || sev.includes('blocker')) return 'urgent';
  if (sev.includes('major') || sev.includes('high')) return 'high';
  if (sev.includes('minor') || sev.includes('low')) return 'low';

  return 'medium';
}

// 카테고리를 이슈 타입으로 매핑
function mapIssueType(category: string): 'bug' | 'feature' | 'inquiry' | 'task' {
  const cat = category?.toLowerCase() || '';

  if (cat.includes('bug') || cat.includes('defect')) return 'bug';
  if (cat.includes('feature') || cat.includes('enhancement')) return 'feature';
  if (cat.includes('support') || cat.includes('inquiry') || cat.includes('question')) return 'inquiry';

  return 'task';
}

export async function POST(request: NextRequest) {
  try {
    const { fileName } = await request.json();

    if (!fileName) {
      return NextResponse.json(
        { error: '파일명이 필요합니다.' },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), 'excels', fileName);

    // 파일 존재 여부 확인
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: '파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Excel 파일을 Buffer로 읽기
    const fileBuffer = fs.readFileSync(filePath);

    // Excel 파일 파싱
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 데이터 파싱 (첫 행은 merge된 헤더, 두번째 행이 실제 헤더)
    const rawData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });

    // 헤더 인덱스 찾기 (두번째 행)
    const headers = rawData[1] as string[];
    const headerIndex: Record<string, number> = {};
    headers.forEach((header, idx) => {
      headerIndex[header] = idx;
    });

    // 데이터 행 파싱 (세번째 행부터)
    const issues = [];
    for (let i = 2; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0) continue;

      const issueNumber = row[headerIndex['Issue Number']];
      if (!issueNumber) continue;

      // 날짜 처리
      let issuedDate: Date | undefined;
      const issuedDateValue = row[headerIndex['Issued date']];
      if (typeof issuedDateValue === 'number') {
        issuedDate = excelDateToJSDate(issuedDateValue);
      }

      const issue = {
        imsNumber: String(issueNumber),
        title: row[headerIndex['Subject']] || `IMS-${issueNumber}`,
        description: [
          `Product: ${row[headerIndex['Product']] || 'N/A'}`,
          `Version: ${row[headerIndex['Version']] || 'N/A'}`,
          `Module: ${row[headerIndex['Module']] || 'N/A'}`,
          `Customer: ${row[headerIndex['Customer']] || 'N/A'}`,
          `Project: ${row[headerIndex['Project']] || 'N/A'}`,
          `Reporter: ${row[headerIndex['Reporter']] || 'N/A'}`,
          `Handler: ${row[headerIndex['Handler']] || 'N/A'}`,
          `Owner: ${row[headerIndex['Owner']] || 'N/A'}`,
        ].join('\n'),
        type: mapIssueType(row[headerIndex['Category']]),
        status: mapStatus(row[headerIndex['Status']]),
        priority: mapPriority(row[headerIndex['Severity']]),
        tags: [
          row[headerIndex['Product']],
          row[headerIndex['Tag']],
        ].filter(Boolean).map(String),
        customer: row[headerIndex['Customer']] || '',
        product: row[headerIndex['Product']] || '',
        issuedDate: issuedDate?.toISOString(),
        imsStatus: row[headerIndex['Status']] || '',
      };

      issues.push(issue);
    }

    return NextResponse.json({
      success: true,
      fileName,
      totalCount: issues.length,
      issues,
    });
  } catch (error) {
    console.error('Excel 파싱 실패:', error);
    return NextResponse.json(
      { error: 'Excel 파일을 파싱할 수 없습니다.' },
      { status: 500 }
    );
  }
}
