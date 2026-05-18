import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createTransport, Transporter } from "nodemailer";

@Injectable()
export class MailService implements OnModuleInit {
    private readonly logger = new Logger(MailService.name);
    private transporter: Transporter | null = null;
    private fromAddress = '';

    constructor(private readonly configService: ConfigService) { }

    onModuleInit() {
        const host = this.configService.get<string>('SMTP_HOST');
        const portStr = this.configService.get<string>('SMTP_PORT');
        const user = this.configService.get<string>('SMTP_USER');
        const pass = this.configService.get<string>('SMTP_PASS');
        const from = this.configService.get<string>('MAIL_FROM');

        if (!host || !portStr || !user || !pass) {
            this.logger.warn('SMTP env vars missing — MailService disabled. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.');
            return;
        }

        const port = Number(portStr);
        this.fromAddress = from || `SpendSnap <${user}>`;
        this.transporter = createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
        });
    }

    async sendOtp(to: string, otp: string, expiresInMinutes: number): Promise<void> {
        if (!this.transporter) {
            throw new InternalServerErrorException('Mail service not configured');
        }

        const subject = 'SpendSnap password reset code';
        const text = [
            `Your SpendSnap password reset code is: ${otp}`,
            ``,
            `This code expires in ${expiresInMinutes} minutes.`,
            `If you did not request a password reset, you can safely ignore this email.`,
        ].join('\n');

        const html = `
            <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto;">
                <h2 style="color: #111;">SpendSnap password reset</h2>
                <p>Your password reset code is:</p>
                <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; padding: 16px; background: #f4f4f5; border-radius: 8px; text-align: center;">
                    ${otp}
                </div>
                <p style="color: #555; margin-top: 16px;">This code expires in <strong>${expiresInMinutes} minutes</strong>.</p>
                <p style="color: #888; font-size: 12px;">If you did not request a password reset, you can safely ignore this email.</p>
            </div>
        `;

        try {
            await this.transporter.sendMail({
                from: this.fromAddress,
                to,
                subject,
                text,
                html,
            });
        } catch (err) {
            this.logger.error(`Failed to send OTP email to ${to}: ${(err as Error).message}`);
            throw new InternalServerErrorException('Failed to send email');
        }
    }
}
