import { utils } from "../utils";
import { processo } from "./processo";

async function main() {
  const { numProcessos, repeticoes } = utils.validarArgumentos();

  const processos: Promise<void>[] = [];

  for (let i = 1; i <= numProcessos; i++) {
    processos.push(processo.iniciar(i, repeticoes));
  }

  await Promise.all(processos);
  console.log("Todos os processos concluídos.");
}

main();
