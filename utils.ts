import * as os from "os";
import * as fs from "fs";
import { argv, exit } from "process";

export const utils = {
  limparTerminal: () => {
    const comando = os.platform() === "win32" ? "\x1Bc" : "\x1B[2J\x1B[0f";

    process.stdout.write(comando);
  },

  registrarLog: (mensagem: string) => {
    fs.appendFileSync(
      "log.txt",
      `${new Date().toISOString()} -- ${mensagem}\n`
    );
  },

  sleep: (milisegundos: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, milisegundos));
  },

  limparArquivos: (arquivos: string[]) => {
    arquivos.forEach((arquivo) => {
      if (fs.existsSync(arquivo)) {
        fs.unlinkSync(arquivo);
      }
    });
  },

  validarArgumentos: () => {
    const numProcessos = parseInt(argv[2]);
    const repeticoes = parseInt(argv[3]);

    if (isNaN(numProcessos) || isNaN(repeticoes)) {
      console.error(
        "Erro: argumentos inválidos. Use: <Num de Processos> <Repeticoes>"
      );
      exit(1);
    }

    return { numProcessos, repeticoes };
  },
};
