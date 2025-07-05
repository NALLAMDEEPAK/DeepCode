import { Controller, Post, Body, HttpException, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { createClient } from '@libsql/client';
import { Request } from 'express';

@Controller()
export class SubmitCodeController {
  private readonly tursoClient;
  constructor(private readonly httpService: HttpService) {
    this.tursoClient = createClient({
      url: process.env.USER_DATA_DB ?? '',
      authToken: process.env.TURSO_AUTH_TOKEN ?? '',
    });
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      await this.tursoClient.execute(`
        CREATE TABLE IF NOT EXISTS user_solved_problems (
          user_id TEXT NOT NULL,
          problem_id TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          solved_at TEXT DEFAULT CURRENT_TIMESTAMP,
          language TEXT,
          solution_code TEXT,
          UNIQUE(user_id, problem_id)
        )`
      );
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  @Post('/submit-code')
  @UseGuards(JwtAuthGuard) // Protect this route with authentication
  async runCode(@Req() req: Request, @Body() body: any): Promise<Record<string, any>> {
    const userId = (req.user as any).googleId;
    const prependCode = `import signal
def handler(signum, frame):
    raise TimeoutError("Time Limit Exceeded")
signal.signal(signal.SIGALRM, handler)
q = int(input())
for _ in range(q):
    signal.alarm(${body.timeout})
    try:
`;

    const appendCode = `\n    except Exception as e:
        print(f"Error: {e}")
    signal.alarm(0)`;

    function indentCode(code: string, indentSpaces: number): string {
      const indent = " ".repeat(indentSpaces);
      return code
        .split("\n")
        .map((line) => (line.trim() ? indent + line : line))
        .join("\n");
    }

    const indentedExistingCode = indentCode(body.code, 8);
    const formatted_code = prependCode + indentedExistingCode + appendCode;
    const url = 'https://p01--deepcode-api--jm2fn5m8z65r.code.run/';
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    const input = `3
2 7 11 15
9
3 2 4
6
1 2 3
4`
    console.log(formatted_code);
    const data = {
      code: formatted_code,
      language: body.langType,
      input: input,
    };

    const arr = input.split('\n').slice(1);
    const inputs: string[] = [];

    for (let i = 0; i < arr.length; i += body.inputLines) {
      let newArr = arr.slice(i, i + body.inputLines);
      let s:string = ""
      for (let j = 0; j < body.inputLines-1; j++) {
        s = s+newArr[j]+'\n';
      }
      s=s+newArr[body.inputLines-1];
      inputs.push(s);
    }

    console.log(inputs)
    const formatSubmitResponse = async (res: string, error: string) => {
        const actuals: string[] = res.split('\n');
        const expected: string[] = ['0 1', '1 2', '0 2']
        const n = expected.length;
        for(let i=0;i<n;i++){
            if (actuals[i] != expected[i]) {
                return {
                    status: 200,
                    passed: i,
                    total: n,
                    expected: expected[i],
                    actual: actuals[i],
                    isError: true,
                    input: inputs[i],
                    isCompilerError: error
                };
            }
        }
        if (!body.isInterView) {
        await this.tursoClient.execute({
          sql: `
            INSERT INTO user_solved_problems (user_id, problem_id, difficulty, solved_at, language, solution_code)
            VALUES (?, ?, ?, ?, ?, ?)
          `,
          args: [
            userId,
            body.problemId,
            body.difficulty,
            new Date().toISOString(),
            body.langType,
            body.code
          ]
        });
        console.log('Problem submission recorded successfully');
      }
        return {
            status: 200,
            passed: n,
            failed: 0
        }
        
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, data, { headers })
      );
      const res = await formatSubmitResponse(response.data.output, response.data.error)
      return res;
    } catch (error) {
      console.error('Error executing code:', error);
      throw new HttpException('Failed to run code', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}