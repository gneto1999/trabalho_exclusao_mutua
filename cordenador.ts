import * as dgram from 'dgram';
import * as readline from 'readline';
import * as fs from 'fs';
import * as os from 'os';

interface Pedido {
    id: string;
    processo: dgram.RemoteInfo;
}

let filaPedidos: Pedido[] = [];
let processosAtendidos: Record<string, number> = {};
let executando = true;
let recebidoRelease = false;

const socketCoordenador = dgram.createSocket('udp4');

// Utilitário para limpar o terminal
function limparTerminal() {
    if (os.platform() === 'win32') {
        process.stdout.write('\x1Bc');
    } else {
        process.stdout.write('\x1B[2J\x1B[0f');
    }
}

// Terminal interativo
function iniciarTerminal() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const prompt = () => {
        rl.question(`\nDigite um comando\n\n1: imprimir a fila de pedidos atual.\n2: imprimir quantas vezes cada processo foi atendido.\n3: encerrar a execução.\n\n`, (resposta) => {
            limparTerminal();
            switch (resposta.trim()) {
                case '1':
                    if (filaPedidos.length === 0) {
                        console.log("Fila vazia");
                    } else {
                        console.log("Fila de pedidos atual:");
                        filaPedidos.forEach(pedido => {
                            console.log(`Processo ${pedido.id}`);
                        });
                    }
                    break;
                case '2':
                    if (Object.keys(processosAtendidos).length === 0) {
                        console.log("Nenhum processo atendido até o momento");
                    } else {
                        console.log("Quantidade de vezes que cada processo foi atendido:");
                        for (const [id, qtd] of Object.entries(processosAtendidos)) {
                            console.log(`Processo ${id}: ${qtd}`);
                        }
                    }
                    break;
                case '3':
                    console.log("Encerrando execução...");
                    executando = false;
                    rl.close();
                    socketCoordenador.close();
                    return;
                default:
                    console.log("Opção inválida");
            }
            console.log("_________________________________________________________");
            prompt();
        });
    };

    prompt();
}

// Receber mensagens via socket
function receberMensagens() {
    socketCoordenador.on('message', (msg, rinfo) => {
        const mensagem = msg.toString();
        const [tipo, id] = mensagem.split('|');

        switch (tipo) {
            case '1': // REQUEST
                registrarLog(`REQUEST -- Processo ${id}`);
                filaPedidos.push({ id, processo: rinfo });
                break;
            case '3': // RELEASE
                processosAtendidos[id] = (processosAtendidos[id] || 0) + 1;
                registrarLog(`RELEASE -- Processo ${id}`);
                recebidoRelease = true;
                break;
            default:
                console.log(`Mensagem inválida: ${mensagem}`);
        }
    });
}

// Garantir exclusão mútua
async function garantirExclusaoMutua() {
    while (executando) {
        if (filaPedidos.length > 0) {
            const pedido = filaPedidos.shift();
            if (pedido) {
                const mensagem = `2|${pedido.id}|`.padEnd(10, '0');
                socketCoordenador.send(mensagem, pedido.processo.port, pedido.processo.address);
                registrarLog(`GRANT   -- Processo ${pedido.id}`);
                recebidoRelease = false;
                while (!recebidoRelease && executando) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        } else {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
}

// Registrar log
function registrarLog(msg: string) {
    fs.appendFileSync('log.txt', `${new Date().toISOString()} -- ${msg}\n`);
}

// Inicialização
function iniciar() {
    // Limpa arquivos
    ['log.txt', 'resultado.txt'].forEach(arquivo => {
        if (fs.existsSync(arquivo)) fs.unlinkSync(arquivo);
    });

    socketCoordenador.bind(8080, 'localhost', () => {
        console.log("Coordenador escutando na porta 8080");

        iniciarTerminal();
        receberMensagens();
        garantirExclusaoMutua(); // Não é await porque é loop contínuo
    });
}

iniciar();
