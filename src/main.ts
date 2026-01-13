import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const key =
    '46847d01aca6b4c8f56b0cfb5e3f87fa2a67103a0afebdd7e709f99d237a9ca4';
  console.log(key);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'same-site' },
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginEmbedderPolicy: { policy: 'require-corp' },
    }),
  );

  // Add missing Permissions-Policy & Cache-Control headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.removeHeader('x-powered-by');
    res.removeHeader('X-Powered-By');
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=()',
    );
    // Adjusted Cache-Control to 'private, max-age=120'
    // This enables short-term private caching to satisfy ZAP Rule 10049 (Cacheable Content)
    // while preventing public caching of sensitive data.
    res.setHeader('Cache-Control', 'private, max-age=120');
    next();
  });

  app.enableCors({
    origin: '3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const config = new DocumentBuilder()
    .setTitle('Software Optimization API')
    .setDescription('The Software Optimization API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
void bootstrap();
