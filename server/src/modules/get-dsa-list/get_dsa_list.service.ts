import { Injectable } from '@nestjs/common';
import { createClient } from '@libsql/client';

@Injectable()
export class DsaListService {
  private readonly tursoClient; 
  constructor() {
    this.tursoClient = createClient({
      url: process.env.DSA_LIST_DB ?? '',
      authToken:
        process.env.TURSO_AUTH_TOKEN ?? '',
    });
  }

  private cleanString(val: string | null | undefined): string {
    return (val || '')
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/^"+|"+$/g, '')
      .trim();
  }

  private parseProblemRow(row: Record<string, any>) {
    const [timeComplexity, spaceComplexity] = this.cleanString(row.Complexity)
      .split('\n')
      .map((s) => s.trim());

    let topics: string[] = [];
    try {
      topics = JSON.parse(row.topics);
    } catch (e) {
      topics = [];
    }
    let examples: any[] = [];
    let examplesString = row.examples;
    if (examplesString.startsWith('"') && examplesString.endsWith('"')) {
      examplesString = examplesString.slice(1, -1);
    }

    examplesString = examplesString
      .replace(/'/g, '"')
      .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":')
      .replace(/\n/g, '')
      .trim();

    examples = JSON.parse(examplesString);

    if (!Array.isArray(examples)) {
      examples = [];
    }

    const constraints = this.cleanString(row.constraints)
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      id: row.id,
      title: this.cleanString(row.title),
      difficulty: this.cleanString(row.difficulty),
      topics,
      description: this.cleanString(row.description),
      youtubeUrl: this.cleanString(row.youtubeUrl),
      solutionCode: this.cleanString(row.solutionCode),
      solutionExplanation: this.cleanString(row.solutionExplanation),
      timeComplexity,
      spaceComplexity,
      examples,
      constraints,
    };
  }

  async getDsaList(): Promise<any> {
    const res = await this.tursoClient.execute('SELECT * FROM dsalist');
    console.log('Raw response from Turso:', res.rows);
    console.log(
      'Response from Turso:',
      res.rows.map(this.parseProblemRow.bind(this)),
    );

    return res.rows.map(this.parseProblemRow.bind(this));
  }
}
