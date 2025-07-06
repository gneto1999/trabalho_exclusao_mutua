import * as dgram from "dgram";
import { utils } from "../utils";
import { terminal } from "./terminal";
import { Pedido } from "./tipos";

export const coordenador = {
  filaPedidos: [] as Pedido[],
  processosAtendidos: {} as Record<string, number>,
  executando: true,
  aguardandoRelease: false,
  socketCoordenador: dgram.createSocket("udp4"),

  iniciar: () => {
    utils.limparArquivos(["log.txt", "resultado.txt"]);

    coordenador.socketCoordenador.bind(8080, "localhost", () => {
      console.log("Coordenador escutando na porta 8080");
      terminal.iniciarTerminal();
      coordenador.receberMensagens();
      coordenador.garantirExclusaoMutua();
    });
  },

  receberMensagens: () => {
    coordenador.socketCoordenador.on("message", (mensagemBuffer, remetente) => {
      const mensagem = mensagemBuffer.toString();
      const [tipo, id] = mensagem.split("|");

      switch (tipo) {
        case "1": // REQUEST
          utils.registrarLog(`REQUEST -- Processo ${id}`);
          coordenador.filaPedidos.push({ id, processo: remetente });
          break;
        case "3": // RELEASE
          coordenador.processosAtendidos[id] =
            (coordenador.processosAtendidos[id] || 0) + 1;
          utils.registrarLog(`RELEASE -- Processo ${id}`);
          coordenador.aguardandoRelease = true;
          break;
        default:
          console.log(`Mensagem inválida recebida: "${mensagem}"`);
      }
    });
  },

  garantirExclusaoMutua: async () => {
    while (coordenador.executando) {
      if (coordenador.filaPedidos.length > 0) {
        const pedido = coordenador.filaPedidos.shift();
        if (pedido) {
          const grantMsg = `2|${pedido.id}|`.padEnd(10, "0");
          coordenador.socketCoordenador.send(
            grantMsg,
            pedido.processo.port,
            pedido.processo.address
          );
          utils.registrarLog(`GRANT   -- Processo ${pedido.id}`);

          coordenador.aguardandoRelease = false;
          while (!coordenador.aguardandoRelease && coordenador.executando) {
            await utils.sleep(100);
          }
        }
      } else {
        await utils.sleep(100);
      }
    }
  },
};
