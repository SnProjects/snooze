import { INestApplicationContext, Logger } from '@nestjs/common';
import { AbstractWsAdapter, MessageMappingProperties } from '@nestjs/websockets';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { WsAdapter } from '@nestjs/platform-ws';

// Define a custom metadata key to specify the WebSocket protocol for each gateway
const WEBSOCKET_PROTOCOL = 'WEBSOCKET_PROTOCOL';

export enum WebSocketProtocol {
  SOCKET_IO = 'socket.io',
  WS = 'ws',
}

export class CustomWsAdapter extends AbstractWsAdapter {
  private logger: Logger = new Logger('CustomWsAdapter');
  private ioAdapter: IoAdapter;
  private wsAdapter: WsAdapter;

  constructor(app: INestApplicationContext) {
    super(app);
    this.logger.log('Creating CustomWsAdapter');
    // Initialize both adapters
    this.ioAdapter = new IoAdapter(app);
    this.wsAdapter = new WsAdapter(app);
  }

  create(port: number, options?: any): any {
    const protocol = options?.[WEBSOCKET_PROTOCOL] || WebSocketProtocol.SOCKET_IO;
    this.logger.log(`Creating WebSocket server on port ${port} with protocol: ${protocol}`);

    if (protocol === WebSocketProtocol.WS) {
      return this.wsAdapter.create(port, options);
    } else {
      return this.ioAdapter.create(port, options);
    }
  }

  bindClientConnect(server: any, callback: (client: any, request: any) => void): void {
    // Determine the protocol based on the server type
    this.logger.log(`Binding client connect for server: ${server}`);
    if (server instanceof require('ws').Server) {
      this.wsAdapter.bindClientConnect(server, callback);
    } else {
      this.ioAdapter.bindClientConnect(server, callback);
    }
  }

  bindMessageHandlers(
    client: any,
    handlers: MessageMappingProperties[],
    transform: (handler: MessageMappingProperties) => any,
  ): void {
    this.logger.log(`Binding message handlers for client: ${client}`);
    // Determine the protocol based on the client type
    if (client instanceof require('ws')) {
      this.wsAdapter.bindMessageHandlers(client, handlers, transform);
    } else {
      this.ioAdapter.bindMessageHandlers(client, handlers, transform);
    }
  }

  close(server: any): Promise<void> {
    this.logger.log(`Closing WebSocket server: ${server}`);
    // Determine the protocol based on the server type
    if (server instanceof require('ws').Server) {
      return this.wsAdapter.close(server);
    } else {
      return this.ioAdapter.close(server);
    }
  }
}

// Helper decorator to specify the WebSocket protocol for a gateway
export function UseWebSocketProtocol(protocol: WebSocketProtocol) {
  return (target: any) => {
    Reflect.defineMetadata(WEBSOCKET_PROTOCOL, protocol, target);
  };
}
