require('dotenv').config();
require('reflect-metadata');

const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./app.module');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
  });

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);

  console.log(`Job Queue API running on port ${port}`);
}

bootstrap();
