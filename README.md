<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

---

## 🤖 AI Integration (OpenCode Proxy)

این پروژه یه **proxy ساده** به یه local OpenCode instance (`http://127.0.0.1:4097`) داره که از طریق `POST /api/ai/ask` در دسترسه.

### معماری

```
Client → POST /api/ai/ask { prompt } → NestJS → OpenCode (localhost:4097) → Response
```

### سورس فایل‌ها

| فایل | توضیح |
|------|-------|
| `src/ai/ai.module.ts` | ماژول |
| `src/ai/ai.controller.ts` | کنترلر (بدون Auth) |
| `src/ai/ai.service.ts` | سرویس - دو تا درخواست: ساخت session + ارسال message |

### پرامپت آماده برای پیاده‌سازی در پروژه جدید

> کافیه این پرامپت رو به هر هوش مصنوعی (Claude, ChatGPT, opencode) بدی تا توی پروژه جدیدت مستقیم بره سراغ پیاده‌سازی:

````
**Backend (NestJS):**
```
یه API به آدرس POST /api/ai/authorized-ask توی NestJS بساز.
این API یه local OpenCode instance روی http://127.0.0.1:4097 رو پروکسی کنه.

- اول یه session به POST /session بزن (بدنه خالی)
- بعد پیام رو به POST /session/{id}/message با body { parts: [{ type: 'text', text: prompt }] } بفرست
- timeout رو 180 ثانیه بذار
- خطاهای session رو 502 برگردون
- خروجی رو به صورت { answer: string } برگردون
- درخواست فقط { prompt: string } بگیره و با class-validator اعتبارسنجی بشه
- نیازی به Auth نداره
```

**Frontend (React):**
```
یه کامپوننت TerminalHero دارم که:
- یسری predefined command داره (help, about, whoami و...)
- اگه دستور predefined نباشه، به POST /api/ai/ask درخواست بده
- حین انتظار یه ...🤔 نمایش بده
- جواب AI رو توی ترمینال نشون بده
- خطا رو هندل کنه
- دو زبانه فارسی/انگلیسی (isRtl ? c.description : c.descriptionEn)
```
````

### چه پروژه‌هایی میشه با این ساختار ساخت

| پروژه | توضیح |
|-------|-------|
| **چت‌بات پشتیبانی** | یه widget توی سایتت بذاری که کاربرا سوال بپرسن و AI جواب بده |
| **دستیار مستندات** | فایل‌های داک خودت رو به OpenCode body بدهی و API سوال جواب کنه |
| **سیستم پرسش و پاسخ روی کدبیس** | یه اینترفیس توی dashboard که ازش سوال programmatic بپرسی |
| **ربات تلگرام/دیسکورد** | به webhook وصل کنی و درخواست‌ها رو بفرستی به این API |
| **پنل ادمین هوشمند** | گزارش‌گیری، سوال از دیتا، یا پیشنهاد خودکار محتوا |
| **ساخت Agent خودکار** | API رو به یه cron یا event listener وصل کنی تا کارهای تکراری رو انجام بده |
| **SIEMTEL AI** | یه اینترفیس آنلاین شبیه v0.dev یا lovable که با حرف زدن site میسازه |

### چیزهایی که میشه با این ساختار انجام داد

- **دسترسی رایگان به AI** — OpenCode خودت روی سرور شخصی میتون用 run کنی، بدون محدودیت API key
- **کنترل کامل روی system prompt** — میتونی personality مدل رو عوض کنی، context بدی، یا role-play تعریف کنی
- **قابلیت توسعه** — میتونی session persistence اضافه کنی، history ذخیره کنی، یا streaming (SSE) بذاری
- **جدا بودن از backend اصلی** — AI سرویس جداگانه‌ست، پس bug نداره و deploy مجزا داره
- **multi-language** — Native support برای فارسی، انگلیسی، عربی
- **قابل استفاده در هر فریمورک** — فقط کافیه یه HTTP request بزنی، پس هر زبانی (Python, Go, PHP, etc) میتونه وصل بشه

- **دانش محدود (Knowledge Base)** — میتونی یه سیستم RAG ساده پیاده کنی که AI فقط بر اساس اطلاعاتی که توی دیتابیس یا فایل‌های خودت داری جواب بده. مثلاً:

  ```
  کاربر سوال می‌پرسد ← جستجو در دانشنامه شخصی ← پیدا کردن نزدیک‌ترین مطلب
  ← چسبوندن مطلب به system prompt ← ارسال به OpenCode
  ← AI فقط از روی همون مطلب جواب می‌ده، نه چیز دیگه‌ای
  ```

  با این روش:
  - **چت‌بات فروشگاهی** که فقط از روی کاتالوگ محصولات تو جواب میده
  - **راهنمای سازمانی** که فقط طبق مستندات داخلی شرکت راهنمایی میکنه
  - **دستیار آموزشی** که فقط از روی کتاب‌های درسی مشخص جواب میده
  - **مشاور حقوقی** که فقط طبق قوانین و قراردادهای آپلود شده پاسخ میده
  - هوش مصنوعی از حیطه دانشی که تعریف کردی خارج نمیشه و جواب بیربط نمیده

---

## 🧠 AI Agent برای کسب‌وکارها

> به جای اینکه فقط یک چت‌بات داشته باشی، یک **«کارمند دیجیتالی»** می‌سازی که بتواند **کار انجام دهد**.

### مثال روزمره: فروشگاه لوازم خانگی

فرض کن صاحب یک مغازه روزی ۱۰۰ پیام در واتساپ دریافت می‌کند:
- قیمت یخچال چنده؟
- موجوده؟
- هزینه ارسال؟
- سفارشم کجاست؟
- ساعت کاری؟

اگر فقط یک **چت‌بات** باشد، جواب می‌دهد.  
اما اگر **AI Agent** باشد، علاوه بر جواب دادن، **کار هم انجام می‌دهد**:

| قابلیت | چت‌بات ساده | AI Agent |
|--------|------------|----------|
| جواب دادن به سوال | ✅ | ✅ |
| بررسی موجودی انبار | ❌ | ✅ |
| خواندن قیمت از سیستم فروش | ❌ | ✅ |
| محاسبه هزینه ارسال | ❌ | ✅ |
| ثبت سفارش | ❌ | ✅ |
| صدور فاکتور | ❌ | ✅ |
| ارسال لینک پرداخت | ❌ | ✅ |
| پیگیری وضعیت ارسال | ❌ | ✅ |

یعنی انگار یک **کارمند ۲۴ ساعته** استخدام کرده‌اند.

### نمونه کسب‌وکارهایی که AI Agent می‌تونن داشته باشن

| کسب‌وکار | کارهایی که Agent انجام میده |
|----------|---------------------------|
| **فروشگاه اینترنتی** | پاسخ به سوالات محصول، بررسی موجودی، ثبت سفارش، پیگیری مرسوله |
| **رستوران/کافی‌شاپ** | گرفتن سفارش آنلاین، استعلام قیمت منو، رزرو میز، تخمین زمان تحویل |
| **آژانس مسافرتی** | جستجوی تور/بلیط، رزرو هتل، صدور فاکتور، پیگیری ویزا |
| **کلینیک/مطب** | نوبت‌دهی آنلاین، استعلام هزینه ویزیت، یادآوری نوبت، آپلود مدارک |
| **املاک** | نمایش لیست ملک‌ها، فیلتر بر اساس بودجه/منطقه، هماهنگی بازدید، مشاوره قیمت |
| **آموزشگاه/موسسه** | ثبت‌نام دوره، پاسخ به سوالات آموزشی، اعلام نتایج، صدور گواهی |
| **تعمیرات/خدمات** | پذیرش درخواست تعمیر، تخمین هزینه، هماهنگی زمان اعزام، پیگیری وضعیت |

### چرا صاحب کسب‌وکار به Agent نیاز داره؟

- **💰 کاهش هزینه:** به جای ۲-۳ نفر پشتیبان، یه Agent دائمی داری
- **⏰ ۲۴/۷ فعال:** حتی نیمه‌شب و تعطیلات هم کار می‌کنه
- **📈 افزایش فروش:** هیچ پیامی بدون پاسخ نمی‌مونه → مشتری نرفته
- **🎯 دقت بالا:** اطلاعات رو مستقیم از سیستم حسابداری/انبار می‌خونه، اشتباه انسانی نداره
- **📊 مقیاس‌پذیر:** فرقی نداره روزی ۱۰ تا پیام باشه یا ۱۰۰۰ تا، همه جواب می‌گیرن
