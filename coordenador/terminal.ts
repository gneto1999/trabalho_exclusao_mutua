import * as readline from "readline";
import { utils } from "../utils";
import { coordenador } from "./coordenador";

export const terminal = {
  exibirMenu: () => {
    console.log(`
==========================================================
Comandos disponíveis:
1 - Mostrar fila de pedidos
2 - Mostrar atendimentos por processo
3 - Encerrar execução
==========================================================
      `);
  },

  iniciarTerminal: () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const prompt = () => {
      rl.question("Escolha uma opção: ", (opcao) => {
        utils.limparTerminal();

        switch (opcao.trim()) {
          case "1":
            terminal.exibirFilaPedidos();
            break;
          case "2":
            terminal.exibirAtendimentos();
            break;
          case "3":
            terminal.encerrarExecucao(rl);
            return;
          default:
            console.log("Opção inválida.");
        }

        console.log(
          "\n_________________________________________________________"
        );
        terminal.exibirMenu();
        prompt();
      });
    };

    utils.limparTerminal();
    terminal.exibirMenu();
    prompt();
  },

  exibirFilaPedidos: () => {
    if (coordenador.filaPedidos.length === 0) {
      console.log("Fila de pedidos vazia.");
    } else {
      console.log("Fila de pedidos:");
      coordenador.filaPedidos.forEach(({ id }, index) => {
        console.log(` ${index + 1}. Processo ${id}`);
      });
    }
  },

  exibirAtendimentos: () => {
    const processos = Object.entries(coordenador.processosAtendidos);
    if (processos.length === 0) {
      console.log("Nenhum processo atendido ainda.");
    } else {
      console.log("Atendimentos por processo:");
      processos.forEach(([id, qtd]) => {
        console.log(` - Processo ${id}: ${qtd} vez(es)`);
      });
    }
  },

  encerrarExecucao: (rl: readline.Interface) => {
    console.log("Encerrando execução...");
    coordenador.executando = false;
    rl.close();
    coordenador.socketCoordenador.close();
  },
};
