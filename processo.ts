import * as dgram from 'dgram';
import * as fs from 'fs';
import { argv, exit } from 'process';

const NUM_PROCESSOS = parseInt(argv[2]);
const REPETICOES = parseInt(argv[3]);

if (isNaN(NUM_PROCESSOS) || isNaN(REPETICOES)) {
    console.error("Erro nos argumentos, utilizar: <Num de Processos> <Repeticoes>");
    exit(1);
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function iniciarProcesso(id: number) {
    const socketProcesso = dgram.createSocket('udp4');
    let execucoes = 0;

    while (execucoes < REPETICOES) {
        const mensagemRequest = `1|${id}|`.padEnd(10, '0');
        socketProcesso.send(mensagemRequest, 8080, 'localhost');

        const mensagemCoordenador = await new Promise<Buffer>((resolve) => {
            socketProcesso.once('message', (msg) => resolve(msg));
        });

        const tipoMensagem = mensagemCoordenador.toString().split("|")[0];

        if (tipoMensagem === "2") {
            fs.appendFileSync("resultado.txt", `${new Date().toISOString()} -- Processo ${id}\n`);
            await sleep(Math.floor(Math.random() * 4000) + 1000); // entre 1 e 4 segundos

            const mensagemRelease = `3|${id}|`.padEnd(10, '0');
            socketProcesso.send(mensagemRelease, 8080, 'localhost');
            execucoes++;
        }

        await sleep(Math.floor(Math.random() * 4000) + 1000); // entre 1 e 4 segundos
    }

    socketProcesso.close();
}

async function main() {
    const processos: Promise<void>[] = [];

    for (let i = 1; i <= NUM_PROCESSOS; i++) {
        processos.push(iniciarProcesso(i));
    }

    await Promise.all(processos);
}

main();
