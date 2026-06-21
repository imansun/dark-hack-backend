import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Profile } from './profile/profile.entity';
import { Service } from './services/services.entity';
import { Work } from './works/works.entity';
import { WorkBadge } from './works/work-badge.entity';
import { Contact } from './contacts/contacts.entity';
import { User } from './users/user.entity';
import { Post } from './posts/post.entity';
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
    entities: [Profile, Service, Work, WorkBadge, Contact, User, Post],
    synchronize: true,
  });

  await dataSource.initialize();

  const profileRepo = dataSource.getRepository(Profile);
  const serviceRepo = dataSource.getRepository(Service);
  const workRepo = dataSource.getRepository(Work);
  const badgeRepo = dataSource.getRepository(WorkBadge);
  const userRepo = dataSource.getRepository(User);
  const postRepo = dataSource.getRepository(Post);

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

  const existingPosts = await postRepo.find();
  if (existingPosts.length === 0) {
    await postRepo.save([
      {
        title: 'معماری نرم‌افزار مدرن با میکروسرویس‌ها',
        title_en: 'Modern Software Architecture with Microservices',
        title_ar: 'هندسة البرمجيات الحديثة مع الخدمات المصغرة',
        content: 'معماری میکروسرویس‌ها یک رویکرد مدرن برای طراحی نرم‌افزار است که در آن برنامه به عنوان مجموعه‌ای از سرویس‌های کوچک و مستقل توسعه می‌یابد. هر سرویس مسئول یک قابلیت تجاری خاص است و می‌تواند به طور مستقل توسعه، استقرار و مقیاس‌دهی شود. این معماری مزایایی مانند انعطاف‌پذیری بالا، مقیاس‌پذیری افقی، و کاهش وابستگی بین تیم‌های توسعه را فراهم می‌کند. با این حال، چالش‌هایی مانند مدیریت ارتباطات بین سرویس‌ها، consistency داده‌ها و مانیتورینگ نیز وجود دارد که باید با ابزارها و الگوهای مناسب مدیریت شوند.',
        content_en: 'Microservices architecture is a modern approach to software design where an application is developed as a collection of small, independent services. Each service is responsible for a specific business capability and can be independently developed, deployed, and scaled. This architecture provides benefits such as high flexibility, horizontal scalability, and reduced dependency between development teams. However, challenges like inter-service communication management, data consistency, and monitoring must be addressed with appropriate tools and patterns.',
        content_ar: 'هندسة الخدمات المصغرة هي نهج حديث لتصميم البرمجيات حيث يتم تطوير التطبيق كمجموعة من الخدمات الصغيرة والمستقلة. كل خدمة مسؤولة عن قدرة تجارية محددة ويمكن تطويرها ونشرها وتوسيع نطاقها بشكل مستقل. توفر هذه الهندسة مزايا مثل المرونة العالية وقابلية التوسع الأفقي وتقليل الاعتماد بين فرق التطوير. ومع ذلك، هناك تحديات مثل إدارة الاتصالات بين الخدمات واتساق البيانات والمراقبة التي يجب معالجتها بالأدوات والأنماط المناسبة.',
        excerpt: 'آشنایی با معماری میکروسرویس‌ها و مزایا و چالش‌های آن در طراحی نرم‌افزارهای مدرن',
        excerpt_en: 'An introduction to microservices architecture, its benefits and challenges in modern software design',
        excerpt_ar: 'مقدمة عن هندسة الخدمات المصغرة ومزاياها وتحدياتها في تصميم البرمجيات الحديثة',
        slug: 'modern-software-architecture-microservices',
        tags: 'معماری, میکروسرویس, نرم‌افزار',
        published: true,
      },
      {
        title: 'امنیت در سامانه‌های برخط: بهترین روش‌ها',
        title_en: 'Online Systems Security: Best Practices',
        title_ar: 'أمن الأنظمة عبر الإنترنت: أفضل الممارسات',
        content: 'امنیت سامانه‌های برخط یک موضوع حیاتی در عصر دیجیتال است. برای محافظت از داده‌ها و سرویس‌های خود، باید از بهترین روش‌های امنیتی پیروی کنید. این شامل استفاده از HTTPS در همه ارتباطات، پیاده‌سازی احراز هویت چندعاملی (MFA)، رمزنگاری داده‌ها در حال انتقال و ذخیره‌سازی، به‌روزرسانی منظم نرم‌افزارها، و انجام تست‌های نفوذ دوره‌ای است. همچنین، رعایت اصول least privilege در دسترسی‌ها و لاگ‌برداری کامل از رویدادهای امنیتی ضروری است.',
        content_en: 'Online systems security is a critical topic in the digital age. To protect your data and services, you should follow security best practices. This includes using HTTPS for all communications, implementing multi-factor authentication (MFA), encrypting data in transit and at rest, regularly updating software, and conducting periodic penetration tests. Additionally, following the principle of least privilege for access control and comprehensive logging of security events is essential.',
        content_ar: 'أمن الأنظمة عبر الإنترنت هو موضوع حاسم في العصر الرقمي. لحماية بياناتك وخدماتك، يجب اتباع أفضل ممارسات الأمان. يشمل ذلك استخدام HTTPS لجميع الاتصالات، وتنفيذ المصادقة متعددة العوامل (MFA)، وتشفير البيانات أثناء النقل والتخزين، وتحديث البرامج بانتظام، وإجراء اختبارات الاختراق الدورية. بالإضافة إلى ذلك، فإن اتباع مبدأ الامتياز الأقل للتحكم في الوصول والتسجيل الشامل للأحداث الأمنية أمر ضروري.',
        excerpt: 'بهترین روش‌های امنیتی برای محافظت از سامانه‌های برخط و داده‌های کاربران',
        excerpt_en: 'Security best practices for protecting online systems and user data',
        excerpt_ar: 'أفضل الممارسات الأمنية لحماية الأنظمة عبر الإنترنت وبيانات المستخدمين',
        slug: 'online-systems-security-best-practices',
        tags: 'امنیت, سامانه برخط, امنیت سایبری',
        published: true,
      },
      {
        title: 'هوش مصنوعی در توسعه نرم‌افزار',
        title_en: 'AI in Software Development',
        title_ar: 'الذكاء الاصطناعي في تطوير البرمجيات',
        content: 'هوش مصنوعی در حال متحول کردن صنعت توسعه نرم‌افزار است. از ابزارهای تکمیل خودکار کد مانند GitHub Copilot گرفته تا سیستم‌های تست خودکار و تحلیل کیفیت کد، AI به توسعه‌دهندگان کمک می‌کند تا سریع‌تر و با کیفیت بالاتری کد بنویسند. مدل‌های زبانی بزرگ (LLM) می‌توانند در مستندسازی، تولید تست، و حتی بازآفرینی کد کمک کنند. همچنین، سیستم‌های توصیه‌گر مبتنی بر AI می‌توانند الگوهای معماری مناسب را پیشنهاد دهند و به شناسایی anti-patternها کمک کنند.',
        content_en: 'AI is transforming the software development industry. From code completion tools like GitHub Copilot to automated testing and code quality analysis systems, AI helps developers write code faster and with higher quality. Large Language Models (LLMs) can assist in documentation, test generation, and even code refactoring. Additionally, AI-based recommendation systems can suggest appropriate architectural patterns and help identify anti-patterns.',
        content_ar: 'الذكاء الاصطناعي يحول صناعة تطوير البرمجيات. من أدوات إكمال الكود مثل GitHub Copilot إلى أنظمة الاختبار الآلي وتحليل جودة الكود، يساعد الذكاء الاصطناعي المطورين على كتابة كود أسرع وبجودة أعلى. يمكن لنماذج اللغة الكبيرة (LLM) المساعدة في التوثيق وإنشاء الاختبارات وحتى إعادة هيكلة الكود. بالإضافة إلى ذلك، يمكن لأنظمة التوصية القائمة على الذكاء الاصطناعي اقتراح أنماط معمارية مناسبة والمساعدة في تحديد الأنماط المضادة.',
        excerpt: 'بررسی تأثیر هوش مصنوعی بر فرآیند توسعه نرم‌افزار و ابزارهای مرتبط',
        excerpt_en: 'Exploring the impact of AI on the software development process and related tools',
        excerpt_ar: 'استكشاف تأثير الذكاء الاصطناعي على عملية تطوير البرمجيات والأدوات ذات الصلة',
        slug: 'ai-in-software-development',
        tags: 'هوش مصنوعی, توسعه نرم‌افزار, AI',
        published: true,
      },
    ]);
    console.log('Sample blog posts created');
  } else {
    console.log('Blog posts already exist, skipping');
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
