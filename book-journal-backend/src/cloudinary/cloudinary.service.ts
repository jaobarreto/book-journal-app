import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'book-journal', // Organiza as imagens em uma pasta específica
          resource_type: 'auto', // Detecta automaticamente o tipo do arquivo
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result)
            return reject(new Error('Upload falhou - resultado indefinido'));
          resolve(result);
        },
      );

      // Converte o buffer do arquivo em stream e faz upload
      const stream = Readable.from(file.buffer);
      stream.pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }
}
