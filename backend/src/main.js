require('reflect-metadata');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./app.module');
const fs = require('fs');
const path = require('path');

async function bootstrap() {
  fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });

  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
  console.log(`Job Queue API running on http://localhost:${port}`);
}

bootstrap();
