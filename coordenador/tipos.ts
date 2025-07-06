import * as dgram from "dgram";

export interface Pedido {
  id: string;
  processo: dgram.RemoteInfo;
}
