// cli.ts
import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './modules/auth/auth.service';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const myService = appContext.get(AuthService);

  function checkRequiredEnvVars(requiredVars: string[]) {
    const missingVars = requiredVars.filter((key) => !process.env[key]);
    if (missingVars.length > 0) {
      console.error(
        `Missing required environment variables: ${missingVars.join(', ')}`,
      );
      process.exit(1);
    }
  }

  // List all env vars used in the application
  const requiredEnvVars = [
    'DB_USERNAME',
    'DB_HOST',
    'DB_NAME',
    'DB_PASSWORD',
    'DB_LOG',
    'DB_PORT',
    'CORS_DEV',
    'CORS_STG',
    'USER_KEY_SECRET',
    'APP_PORT',
    'SUPERADMIN_NAME',
    'SUPERADMIN_USERNAME',
    'SUPERADMIN_PASSWORD',
  ];

  checkRequiredEnvVars(requiredEnvVars);

  await myService.init();

  await appContext.close();
}

bootstrap();
