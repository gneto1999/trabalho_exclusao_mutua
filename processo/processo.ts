import * as dgram from "dgram";
import * as fs from "fs";
import { utils } from "../utils";

export const processo = {
  async iniciar(id: number, repeticoes: number) {
    const socket = dgram.createSocket("udp4");
    let execucoes = 0;

    while (execucoes < repeticoes) {
      await processo.enviarRequest(socket, id);

      const granted = await processo.esperarGrant(socket);
      if (granted) {
        processo.registrarExecucao(id);
        await utils.sleep(processo.tempoAleatorio());

        await processo.enviarRelease(socket, id);
        execucoes++;
      }

      await utils.sleep(processo.tempoAleatorio());
    }

    socket.close();
  },

  enviarRequest(socket: dgram.Socket, id: number) {
    const msg = `1|${id}|`.padEnd(10, "0");
    socket.send(msg, 8080, "localhost");
  },

  esperarGrant(socket: dgram.Socket): Promise<boolean> {
    return new Promise((resolve) => {
      socket.once("message", (mensagem) => {
        const tipo = mensagem.toString().split("|")[0];
        resolve(tipo === "2");
      });
    });
  },

  enviarRelease(socket: dgram.Socket, id: number) {
    const msg = `3|${id}|`.padEnd(10, "0");
    socket.send(msg, 8080, "localhost");
  },

  registrarExecucao(id: number) {
    const log = `${new Date().toISOString()} -- Processo ${id}\n`;
    fs.appendFileSync("resultado.txt", log);
  },

  tempoAleatorio() {
    return Math.floor(Math.random() * 4000) + 1000;
  },
};
