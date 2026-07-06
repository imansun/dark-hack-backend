import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ProfileModule } from './profile/profile.module';
import { ServicesModule } from './services/services.module';
import { WorksModule } from './works/works.module';
import { ContactsModule } from './contacts/contacts.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { CategoriesModule } from './categories/categories.module';
import { CommentsModule } from './comments/comments.module';
import { SubscribersModule } from './subscribers/subscribers.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { GithubModule } from './github/github.module';
import { TurnstileModule } from './common/turnstile.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'portfolio_backend',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
      exclude: ['/api/(.*)', '/uploads/(.*)'],
      serveStaticOptions: {
        index: ['index.html'],
        setHeaders(res) {
          res.setHeader('Access-Control-Allow-Origin', '*');
        },
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
        setHeaders(res) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        },
      },
    }),
    AuthModule,
    ProfileModule,
    ServicesModule,
    WorksModule,
    ContactsModule,
    PostsModule,
    CategoriesModule,
    CommentsModule,
    SubscribersModule,
    AuditLogModule,
    GithubModule,
    TurnstileModule,
    AiModule,
  ],
})
export class AppModule {}
