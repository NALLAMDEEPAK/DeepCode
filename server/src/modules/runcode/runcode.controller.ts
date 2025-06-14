import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller()
export class RunCodeController {
  constructor(private readonly httpService: HttpService) {}

  @Post('/run-code')
  async runCode(@Body() body: any): Promise<Record<string, any>> {


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
    console.log(body.code);
    console.log(body.input)
    const data = {
      code: body.code,
      language: body.langType,
      input: body.input,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, data, { headers })
      );
      console.log(response.data)
      return response.data;
    } catch (error) {
      console.error('Error executing code:', error);
      throw new HttpException('Failed to run code', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
