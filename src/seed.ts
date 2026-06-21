import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Profile } from './profile/profile.entity';
import { Service } from './services/services.entity';
import { Work } from './works/works.entity';
import { WorkBadge } from './works/work-badge.entity';
import { Contact } from './contacts/contacts.entity';
import { User } from './users/user.entity';
import * as mysql from 'mysql2/promise';

async function ensureDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'portfolio_backend'}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
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
    database: process.env.DB_NAME || 'portfolio_backend',
    entities: [Profile, Service, Work, WorkBadge, Contact, User],
    synchronize: true,
  });

  await dataSource.initialize();

  const profileRepo = dataSource.getRepository(Profile);
  const serviceRepo = dataSource.getRepository(Service);
  const workRepo = dataSource.getRepository(Work);
  const badgeRepo = dataSource.getRepository(WorkBadge);
  const userRepo = dataSource.getRepository(User);

  const adminUser = await userRepo.findOne({ where: { username: 'admin' } });
  if (!adminUser) {
    const hashed = await bcrypt.hash('97531372', 10);
    await userRepo.save({
      username: 'admin',
      password: hashed,
      role: 'admin',
    });
    console.log('Admin user "admin" created (password: 97531372)');
  } else {
    console.log('Admin user already exists');
  }

  const existing = await profileRepo.find();
  if (existing.length > 0) {
    console.log('Seed data already exists, skipping profile/services/works...');
    await dataSource.destroy();
    return;
  }

  await profileRepo.save({
    name: 'Iman Norouzi',
    name_en: 'Iman Norouzi',
    name_ar: 'إيمان نوروزي',
    title: 'متخصص هوش مصنوعی، معماری نرم‌افزار و امنیت سامانه‌های برخط',
    title_en: 'AI Specialist, Software Architect & Online Systems Security Expert',
    title_ar: 'خبير في الذكاء الاصطناعي، وهندسة البرمجيات، وأمن الأنظمة عبر الإنترنت',
    subtitle: 'سلام! من',
    subtitle_en: 'Hello! I am',
    subtitle_ar: 'مرحباً! أنا',
    description:
      'در زمینه طراحی و توسعه راهکارهای هوشمند، معماری سیستم‌های نرم‌افزاری و امنیت خدمات آنلاین فعالیت می‌کنم. تمرکز من بر تحلیل نیازمندی‌ها، طراحی معماری‌های مقیاس‌پذیر، توسعه سامانه‌های مبتنی بر هوش مصنوعی و ارتقای امنیت زیرساخت‌های دیجیتال است. با بهره‌گیری از فناوری‌های نوین، راهکارهایی ایجاد می‌کنم که علاوه بر کارایی و عملکرد بالا، از پایداری، توسعه‌پذیری و امنیت مناسب برخوردار باشند.',
    description_en:
      'I specialize in designing and developing intelligent solutions, software architecture, and securing online services. My focus is on requirements analysis, designing scalable architectures, developing AI-based systems, and enhancing digital infrastructure security. Leveraging modern technologies, I create solutions that offer high performance, stability, scalability, and robust security.',
    description_ar:
      'أنا متخصص في تصميم وتطوير الحلول الذكية وهندسة البرمجيات وأمن الخدمات عبر الإنترنت. تركيزي ينصب على تحليل المتطلبات، وتصميم الهياكل القابلة للتوسع، وتطوير الأنظمة القائمة على الذكاء الاصطناعي، وتعزيز أمن البنية التحتية الرقمية. باستخدام التقنيات الحديثة، أقدم حلولاً تجمع بين الأداء العالي والاستقرار وقابلية التوسع والأمان المتين.',
  });

  await serviceRepo.save([
    {
      title: 'استقرار',
      title_en: 'Deployment',
      title_ar: 'النشر',
      description: 'همیشه آماده پاسخگویی به هرگونه مشکل یا نگرانی شما هستم.',
      description_en:
        'I am always available to address any issues or concerns you may have.',
      description_ar:
        'أنا دائمًا متاح لمعالجة أي مشاكل أو استفسارات قد تكون لديك.',
      order: 1,
    },
    {
      title: 'طراحی',
      title_en: 'Design',
      title_ar: 'التصميم',
      description:
        'متخصص در خلق وب‌سایت‌های stunning که visually appealing و user-friendly هستند.',
      description_en:
        'Specialized in creating stunning websites that are both visually appealing and user-friendly.',
      description_ar:
        'متخصص في إنشاء مواقع ويب مذهلة وجذابة بصريًا وسهلة الاستخدام.',
      order: 2,
    },
    {
      title: 'توسعه',
      title_en: 'Developing',
      title_ar: 'التطوير',
      description: 'خدمات توسعه وب سفارشی متناسب با نیازهای خاص شما.',
      description_en:
        'I offer custom web development services tailored to your specific needs as a solo professional.',
      description_ar:
        'أقدم خدمات تطوير ويب مخصصة تناسب احتياجاتك الخاصة كمحترف مستقل.',
      order: 3,
    },
  ]);

  for (let i = 1; i <= 6; i++) {
    const work = await workRepo.save({
      title: 'صفحه فرود من',
      title_en: 'My Landing Page',
      title_ar: 'صفحتي الرئيسية',
      description: 'یک صفحه فرود زیبا با فناوری‌های مدرن وب ساخته شده است.',
      description_en:
        'A beautiful landing page built with modern web technologies.',
      description_ar: 'صفحة هبوط جميلة مبنية بتقنيات الويب الحديثة.',
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
