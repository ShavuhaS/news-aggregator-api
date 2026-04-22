import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, BadRequestException, Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(cookieParser());

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.enableCors({
    origin: configService.get<string>('frontendUrl'),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        return new BadRequestException(errors);
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('News Aggregator API')
    .setDescription('The News Aggregator API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('accessToken')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const kafkaBrokers = configService.get<string[]>('kafka.brokers');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: kafkaBrokers || ['localhost:9092'],
      },
      consumer: {
        groupId: 'aggregator-api-consumer',
      },
    },
  });

  await app.startAllMicroservices();

  const port = configService.get<number>('port') || 3000;
  await app.listen(port);

  Logger.log(`Application is running on port: ${port}`);
  Logger.log(`Swagger UI is available at: http://localhost:${port}/docs`);
}
bootstrap();
