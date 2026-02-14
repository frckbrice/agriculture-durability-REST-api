import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './global/filter/http-exception.filter';
// reflect-metadata is used to allow the usage of class transformers to be applied to remove password.
import 'reflect-metadata';

// certificate purpose
import * as fs from 'fs';
import * as https from 'https';
import { SubscriptionManagementService } from './resources/subscriptions/subscribe.deactivation';

const PORT = process.env.PORT ?? 5005;
const dev_server_url = `${process.env.LOCAL_API_URL} `;
const production_server_url = `${process.env.PROD_API_URL} `;

async function bootstrap() {

  // certificate options
  // const httpsOptions = {
  //   key: fs.readFileSync('./key.pem'),
  //   cert: fs.readFileSync('./cert.pem'),
  // };
  // const app = await NestFactory.create(AppModule, { 
  // cors: true, 
  //  httpsOptions 
  // });
  const app = await NestFactory.create(AppModule, { cors: true });

  // Manually retrieve and trigger the service to ensure instantiation
  const subscriptionService = app.get(SubscriptionManagementService);
  await subscriptionService.checkSubscriptions(); // Optionally trigger it once


  // call the http adapter here
  const { httpAdapter } = app.get(HttpAdapterHost);

  // apply global filters for not handled exceptions
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  app.setGlobalPrefix('v1');
  const config = new DocumentBuilder()
    .addBearerAuth() // bearer auth enabled
    .setTitle('Agriculture-durability api')
    .setDescription('The Agriculture-durability API documentation')
    .setVersion('1.0')
    .addTag('Agriculture-durability-api')
    .build();

  // override operationIdFactory to make it unique per method
  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api', app, document, {
    jsonDocumentUrl: 'swagger/json',
    // useGlobalPrefix: true,
    yamlDocumentUrl: 'swagger/yaml',
  });

  const environment = process.env.NODE_ENV || 'development';

  await app.listen(PORT, async () => {
    console.log(
      // `Server running  in ${environment} mode on  ${environment === 'production' ? production_server_url : await app.getUrl()}`,
      `Server running  in ${environment} mode on  ${environment === 'production' ? production_server_url : dev_server_url}`,
    );
  });
}
bootstrap();
