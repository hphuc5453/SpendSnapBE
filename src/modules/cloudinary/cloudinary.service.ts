// src/cloudinary/cloudinary.service.ts
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier'; // Cài thêm: npm install streamifier @types/streamifier

@Injectable()
export class CloudinaryService {
    async uploadFile(file: Express.Multer.File | undefined): Promise<UploadApiResponse | UploadApiErrorResponse> {
        if (!file) {
            throw new Error('File không tồn tại');
        }

        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream((error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result as UploadApiResponse | UploadApiErrorResponse);
            });

            if (!file || !file.buffer) {
                return reject(new Error('File không tồn tại hoặc Buffer trống'));
            }

            streamifier.createReadStream(file.buffer).pipe(upload);
        });
    }
}