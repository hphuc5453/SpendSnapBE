import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtShareService {
    constructor(
        private readonly jwtService: JwtService,
    ) {

    }

    async verifyAccessToken(token: string) {
        return this.jwtService.verifyAsync(token, {})
    }
}