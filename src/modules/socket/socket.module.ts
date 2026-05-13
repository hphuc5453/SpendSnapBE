import { Module } from '@nestjs/common';
import { JwtShareModule } from '../auth/jwt-share.module';
import { SocketGateway } from './socket.gateway';

@Module({
    imports: [JwtShareModule],
    providers: [SocketGateway],
    exports: [SocketGateway],
})
export class SocketModule { }
