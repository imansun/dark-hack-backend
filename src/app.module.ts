import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileModule } from './profile/profile.module';
import { ServicesModule } from './services/services.module';
import { WorksModule } from './works/works.module';
import { ContactsModule } from './contacts/contacts.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'dark_hack_backend',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ProfileModule,
    ServicesModule,
    WorksModule,
    ContactsModule,
  ],
})
export class AppModule {}
