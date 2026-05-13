import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export type InvalidatedResource = 'transactions' | 'statistics' | 'categories' | 'budgets';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(SocketGateway.name);

    @WebSocketServer()
    server!: Server;

    constructor(
        private configService: ConfigService,
        private jwtService: JwtService,
    ) { }

    afterInit(): void {
        this.logger.log('Socket gateway initialized');
    }

    async handleConnection(client: Socket): Promise<void> {
        try {
            const token = extractToken(client);
            if (!token) throw new Error('Missing token');

            const payload: any = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('APP_SECRET'),
            });
            const userId: string | undefined = payload?.sub;
            if (!userId) throw new Error('Invalid token payload');

            client.data.userId = userId;
            await client.join(roomFor(userId));
            this.logger.log(`Client ${client.id} joined ${roomFor(userId)}`);
        } catch (err: any) {
            this.logger.warn(`Rejecting socket ${client.id}: ${err?.message ?? 'unknown error'}`);
            client.emit('auth:error', { message: err?.message ?? 'Unauthorized' });
            client.disconnect(true);
        }
    }

    handleDisconnect(client: Socket): void {
        const userId = client.data?.userId ?? 'unknown';
        this.logger.log(`Client ${client.id} disconnected (user=${userId})`);
    }

    emitInvalidated(userId: string, affected: InvalidatedResource[]): void {
        if (!this.server) return;
        this.server.to(roomFor(userId)).emit('data:invalidated', { affected });
    }
}

function roomFor(userId: string): string {
    return `user:${userId}`;
}

function extractToken(client: Socket): string | undefined {
    const stripBearer = (raw: string) => raw.replace(/^Bearer\s+/i, '');

    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.length > 0) return stripBearer(authToken);

    const headerAuth = client.handshake.headers.authorization;
    if (typeof headerAuth === 'string' && headerAuth.length > 0) return stripBearer(headerAuth);

    const queryToken = client.handshake.query?.token;
    if (typeof queryToken === 'string' && queryToken.length > 0) return stripBearer(queryToken);

    return undefined;
}
