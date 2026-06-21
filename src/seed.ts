import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Profile } from './profile/profile.entity';
import { Service } from './services/services.entity';
import { Work } from './works/works.entity';
import { WorkBadge } from './works/work-badge.entity';
import { Contact } from './contacts/contacts.entity';
import * as mysql from 'mysql2/promise';

async function ensureDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'dark_hack_backend'}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await connection.end();
}

async function seed() {
  await ensureDatabase();

  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dark_hack_backend',
    entities: [Profile, Service, Work, WorkBadge, Contact],
    synchronize: true,
  });

  await dataSource.initialize();

  const profileRepo = dataSource.getRepository(Profile);
  const serviceRepo = dataSource.getRepository(Service);
  const workRepo = dataSource.getRepository(Work);
  const badgeRepo = dataSource.getRepository(WorkBadge);

  const existing = await profileRepo.find();
  if (existing.length > 0) {
    console.log('Seed data already exists, skipping...');
    await dataSource.destroy();
    return;
  }

  await profileRepo.save({
    name: 'Hax',
    title: 'Web Developer',
    subtitle: 'Hello There! I am a',
    description:
      'As a front-end web developer, my passion lies in creating beautiful and intuitive user experiences through the use of clean and efficient code.',
  });

  await serviceRepo.save([
    {
      title: 'Deployment',
      description: 'I am always available to address any issues or concerns you may have.',
      order: 1,
    },
    {
      title: 'Design',
      description: 'Specialized in creating stunning websites that are both visually appealing and user-friendly.',
      order: 2,
    },
    {
      title: 'Developing',
      description: 'I offer custom web development services tailored to your specific needs as a solo professional.',
      order: 3,
    },
  ]);

  for (let i = 1; i <= 6; i++) {
    const work = await workRepo.save({
      title: 'My Landing Page',
      description: 'A beautiful landing page built with modern web technologies.',
    });
    await badgeRepo.save([
      { workId: work.id, name: 'HTML' },
      { workId: work.id, name: 'CSS' },
      { workId: work.id, name: 'JavaScript' },
    ]);
  }

  console.log('Seed data inserted successfully!');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
