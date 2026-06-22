import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Work } from './works/works.entity';
import { WorkBadge } from './works/work-badge.entity';

async function seedLicenses() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portfolio_backend',
    entities: [Work, WorkBadge],
    synchronize: true,
  });

  await dataSource.initialize();
  const workRepo = dataSource.getRepository(Work);
  const badgeRepo = dataSource.getRepository(WorkBadge);

  const allBadges = await badgeRepo.find();
  if (allBadges.length) await badgeRepo.remove(allBadges);
  const allWorks = await workRepo.find();
  if (allWorks.length) await workRepo.remove(allWorks);

  const licenses = [
    { title: 'درخواست دریافت مجوز کسب و کار خانگی برنامه نویسی نرم افزار', imageUrl: '/uploads/works/license-01.png' },
    { title: 'درخواست دریافت مجوز کسب و کار خانگی تولید محتوای نرم افزار', imageUrl: '/uploads/works/license-02.png' },
    { title: 'درخواست دریافت مجوز کسب و کار خانگی طراحی ارتباط تصویری', imageUrl: '/uploads/works/license-03.png' },
    { title: 'درخواست دریافت مجوز کسب و کار خانگی طراحی معماری سیستم نرم افزار', imageUrl: '/uploads/works/license-04.png' },
    { title: 'درخواست دریافت مجوز کسب و کار خانگی طراحی پایگاه', imageUrl: '/uploads/works/license-05.png' },
    { title: 'درخواست دریافت مجوز کسب و کار خانگی کارشناس امنیت رسانه برخط', imageUrl: '/uploads/works/license-06.png' },
    { title: 'درگاه ملی مجوزهای کشور', imageUrl: '/uploads/works/license-07.png' },
    { title: 'کسب و کار خانگی جستجو و گردآوری محتوا نرم افزار رایانه ای', imageUrl: '/uploads/works/license-08.png' },
    { title: 'کسب و کار خانگی طراحی برخط', imageUrl: '/uploads/works/license-09.png' },
    { title: 'کسب و کار خانگی طراحی رابط کاربری', imageUrl: '/uploads/works/license-10.png' },
  ];

  for (const lic of licenses) {
    await workRepo.save(workRepo.create(lic));
  }

  console.log(`Inserted ${licenses.length} licenses`);
  await dataSource.destroy();
}

seedLicenses().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
