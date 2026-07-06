import { config } from 'dotenv';
config();
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './users/user.entity';
import { Profile } from './profile/profile.entity';

async function seed() {
  const ds = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portfolio_backend',
    entities: [User, Profile],
    synchronize: false,
  });
  await ds.initialize();
  const em = ds.manager;

  const existing = await em.findOne(User, { where: { username: process.env.ADMIN_USERNAME || 'admin' } });
  if (!existing) {
    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin', 10);
    await em.save(User, { username: process.env.ADMIN_USERNAME || 'admin', password: hashed, role: 'admin' });
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }

  const profiles = await em.find(Profile, { take: 1 });
  if (profiles.length === 0) {
    await em.save(Profile, {
      name: 'ایمان نوروزی اسفجیر',
      name_en: 'Iman Norouzi Esfajir',
      name_ar: 'إيمان نوروزي اسفجير',
      title: 'توسعه‌دهنده فول استک',
      title_en: 'Full Stack Developer',
      title_ar: 'مطور فول ستاك',
      subtitle: 'طراحی و توسعه وبسایت و اپلیکیشن',
      subtitle_en: 'Design and Develop Websites and Apps',
      subtitle_ar: 'تصميم وتطوير المواقع والتطبيقات',
      description: 'توسعه‌دهنده فول استک با تجربه در React و Node.js',
      description_en: 'Full Stack Developer experienced in React and Node.js',
      description_ar: 'مطور فول ستاك ذو خبرة في React و Node.js',
    });
    console.log('Profile created');
  } else {
    console.log('Profile already exists');
  }

  await ds.destroy();
  console.log('Seed completed');
}
seed().catch((err) => { console.error(err); process.exit(1); });
