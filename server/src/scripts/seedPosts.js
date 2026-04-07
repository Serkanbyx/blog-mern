const mongoose = require("mongoose");
const { MONGO_URI } = require("../config/env");
const User = require("../models/User");
const Post = require("../models/Post");

const posts = [
  {
    title: "JavaScript'te Async/Await Kullanımı ve En İyi Pratikler",
    content: `Modern JavaScript geliştirmede async/await, asenkron işlemleri yönetmenin en okunabilir ve güçlü yoludur. Callback hell ve karmaşık Promise zincirlerinin yerini alan bu yapı, kodunuzu senkron görünümlü hale getirirken tüm asenkron avantajları korur.

Async/Await Nedir?

ES2017 ile tanıtılan async/await, Promise tabanlı asenkron kodun yazılmasını kolaylaştıran bir sözdizimi şekeridir. "async" anahtar kelimesi bir fonksiyonu asenkron olarak işaretlerken, "await" bir Promise'in çözülmesini bekler.

Hata Yönetimi

Async/await ile hata yönetimi try/catch blokları üzerinden yapılır. Bu yaklaşım, senkron kodda alışkın olduğumuz hata yakalama mekanizmasının aynısıdır. Her zaman catch bloğunda anlamlı hata mesajları üretmeye özen gösterin.

Paralel İşlemler

Birbirinden bağımsız asenkron işlemleri Promise.all() ile paralel çalıştırmak performansı önemli ölçüde artırır. Sıralı await kullanmak yerine, bağımsız işlemleri gruplayarak toplam bekleme süresini en uzun işlem süresine düşürebilirsiniz.

Async/await, JavaScript ekosisteminin vazgeçilmez bir parçası haline gelmiştir. Doğru kullanıldığında kodunuzun hem okunabilirliğini hem de bakım kolaylığını büyük ölçüde artırır.`,
    tags: ["JavaScript", "Async", "Web Development"],
    status: "published",
  },
  {
    title: "React Hooks ile Modern State Yönetimi",
    content: `React 16.8 ile birlikte gelen Hooks, fonksiyonel bileşenlerde state ve lifecycle yönetimini mümkün kılarak React geliştirme paradigmasını kökten değiştirdi. Artık class bileşenlerine ihtiyaç duymadan güçlü ve yeniden kullanılabilir mantık yazabiliyoruz.

useState ve useEffect

useState, bileşen içinde lokal state tutmanın en basit yoludur. useEffect ise side effect'leri — API çağrıları, abonelikler, DOM manipülasyonu — yönetmek için kullanılır. Bu iki hook, çoğu bileşen ihtiyacını karşılar.

Custom Hooks

Custom hook'lar, tekrarlayan mantığı soyutlayarak bileşenler arasında paylaşmanızı sağlar. Örneğin, form yönetimi, API çağrıları veya local storage işlemleri için özel hook'lar yazabilirsiniz. Bu yaklaşım DRY prensibine uygun, test edilebilir ve modüler bir mimari sunar.

useReducer ile Karmaşık State

Birbirine bağlı birden fazla state değişkeni olduğunda useReducer daha tahmin edilebilir bir yönetim sunar. Redux benzeri bir yapıyı bileşen seviyesinde uygulayarak karmaşık state geçişlerini tek bir yerden kontrol edebilirsiniz.

Hooks, React'in geleceğidir. Fonksiyonel programlama prensiplerini benimseyerek daha temiz, test edilebilir ve bakımı kolay uygulamalar geliştirmek artık her zamankinden daha kolay.`,
    tags: ["React", "Hooks", "Frontend"],
    status: "published",
  },
  {
    title: "Node.js ile RESTful API Tasarım Rehberi",
    content: `Başarılı bir web uygulamasının temelinde iyi tasarlanmış bir API yatar. RESTful mimari prensiplerini doğru uygulayarak ölçeklenebilir, anlaşılır ve bakımı kolay API'ler oluşturabilirsiniz.

REST Prensipleri

REST (Representational State Transfer), HTTP protokolünü temel alan bir mimari stildir. Kaynakları URL'ler ile temsil eder ve HTTP metotlarını — GET, POST, PUT, DELETE — işlem türlerini belirtmek için kullanır. Stateless yapısı sayesinde her istek kendi içinde bağımsızdır.

URL Tasarımı

İyi bir URL yapısı, API'nizin anlaşılabilirliğini doğrudan etkiler. İsimlendirmede çoğul isimler kullanın (/users, /posts), fiillerden kaçının ve hiyerarşik ilişkileri URL'de yansıtın (/users/:id/posts).

Hata Yönetimi ve Durum Kodları

HTTP durum kodlarını doğru kullanmak API'nizin profesyonelliğini artırır. 200 serisi başarı, 400 serisi istemci hataları, 500 serisi sunucu hataları için kullanılır. Her hata yanıtında tutarlı bir format ve açıklayıcı mesajlar sunun.

Güvenlik

Rate limiting, input validation, CORS yapılandırması ve JWT tabanlı authentication API güvenliğinin temel taşlarıdır. Hassas verileri asla URL parametrelerinde taşımayın ve tüm girdileri sunucu tarafında doğrulayın.

İyi tasarlanmış bir API, yalnızca bugünün ihtiyaçlarını karşılamakla kalmaz, gelecekteki değişikliklere de kolayca adapte olabilir.`,
    tags: ["Node.js", "API", "Backend"],
    status: "published",
  },
  {
    title: "MongoDB ile Veritabanı Modelleme Stratejileri",
    content: `MongoDB, NoSQL veritabanları arasında en popüler olanlardan biridir. Esnek şema yapısı ve doküman tabanlı mimarisi, modern uygulamalar için güçlü bir temel sunar. Ancak bu esneklik, dikkatli bir modelleme stratejisi gerektirir.

Embedding vs Referencing

MongoDB'de veri modellemenin iki temel yaklaşımı vardır: verileri iç içe gömmek (embedding) veya referans kullanmak. Sık birlikte okunan ve güncellenen veriler için embedding, bağımsız yaşam döngüsüne sahip veriler için referencing tercih edilmelidir.

İndeksleme

Doğru indeksleme, sorgu performansını dramatik şekilde artırır. Sık sorgulanan alanlar, sıralama kriterleri ve filtreleme koşulları için indeks oluşturun. Ancak gereksiz indekslerden kaçının çünkü yazma performansını olumsuz etkilerler.

Aggregation Pipeline

MongoDB'nin aggregation framework'ü, karmaşık veri dönüşümlerini ve analizlerini veritabanı seviyesinde gerçekleştirmenizi sağlar. $match, $group, $lookup gibi stage'ler ile güçlü sorgular yazabilirsiniz.

Başarılı bir MongoDB modelleme stratejisi, uygulamanızın okuma/yazma paternlerini, veri ilişkilerini ve ölçeklenme ihtiyaçlarını dikkate almalıdır.`,
    tags: ["MongoDB", "Database", "NoSQL"],
    status: "published",
  },
  {
    title: "CSS Grid ve Flexbox: Ne Zaman Hangisini Kullanmalı?",
    content: `Modern CSS layout sistemleri olan Grid ve Flexbox, web tasarımında devrim yarattı. Her ikisi de güçlü araçlardır, ancak farklı senaryolarda parlarlar. Doğru aracı seçmek, hem geliştirme hızınızı hem de kodunuzun bakım kolaylığını etkiler.

Flexbox: Tek Boyutlu Layout

Flexbox, öğeleri tek bir eksen boyunca — yatay veya dikey — hizalamak için idealdir. Navigasyon menüleri, kart satırları, form elemanları ve merkezleme işlemleri Flexbox'ın en güçlü olduğu alanlardır. justify-content ve align-items ile hızlıca profesyonel hizalamalar yapabilirsiniz.

CSS Grid: İki Boyutlu Layout

Grid, hem satır hem sütun bazında kontrol gerektiren karmaşık layout'lar için tasarlanmıştır. Sayfa düzenleri, dashboard'lar, galeri görünümleri ve asimetrik tasarımlar Grid ile çok daha kolay uygulanır. grid-template-areas ile görsel olarak layout'unuzu tanımlayabilirsiniz.

Birlikte Kullanım

En güçlü yaklaşım, Grid ve Flexbox'ı birlikte kullanmaktır. Genel sayfa yapısını Grid ile oluştururken, bileşen içi hizalamalar için Flexbox tercih edebilirsiniz. Bu hibrit yaklaşım, hem esneklik hem de kontrol sağlar.

Sonuç olarak, layout ihtiyacınız tek boyutluysa Flexbox, iki boyutluysa Grid kullanın. İkisini birlikte kullandığınızda CSS'in gerçek gücünü keşfedeceksiniz.`,
    tags: ["CSS", "Frontend", "Web Design"],
    status: "published",
  },
  {
    title: "Git ile Etkili Versiyon Kontrolü ve Branch Stratejileri",
    content: `Git, yazılım geliştirmenin olmazsa olmazıdır. Ancak Git'i gerçekten etkili kullanmak, temel komutları bilmenin ötesinde iyi bir branch stratejisi ve iş akışı gerektirir.

Branch Stratejileri

Gitflow, GitHub Flow ve Trunk-Based Development en yaygın branch stratejileridir. Küçük ekipler için GitHub Flow'un basitliği ideal olabilirken, büyük projeler Gitflow'un yapısal avantajlarından faydalanabilir. Önemli olan ekibinize uygun stratejiyi seçmektir.

Anlamlı Commit Mesajları

İyi commit mesajları, projenin geçmişini okunabilir kılar. Conventional Commits formatı (feat:, fix:, refactor:) hem tutarlılık sağlar hem de otomatik changelog oluşturmayı mümkün kılar. Her commit tek bir mantıksal değişikliği kapsamalıdır.

Rebase vs Merge

Feature branch'leri ana branch'e entegre ederken rebase temiz bir geçmiş sunarken, merge commit'leri branch tarihçesini korur. Ekip içinde tutarlı bir yaklaşım benimsemek karışıklığı önler.

Conflict Çözümü

Merge conflict'leri kaçınılmazdır. Düzenli olarak ana branch'ten güncellemeleri almak, küçük ve odaklı commit'ler yapmak ve iyi iletişim kurmak conflict'leri minimize eder.

Git, bir araçtan çok bir disiplindir. İyi Git pratikleri, ekip verimliliğini ve kod kalitesini doğrudan etkiler.`,
    tags: ["Git", "DevOps", "Version Control"],
    status: "published",
  },
  {
    title: "Web Uygulamalarında Güvenlik: OWASP Top 10",
    content: `Web güvenliği, her geliştiricinin sorumluluğudur. OWASP Top 10, web uygulamalarındaki en kritik güvenlik risklerini sıralar ve her geliştirici bu tehditleri bilmeli, önlem almalıdır.

Injection Saldırıları

SQL Injection, NoSQL Injection ve Command Injection, kullanıcı girdilerinin doğrudan sorgulara dahil edilmesiyle gerçekleşir. Parametreli sorgular, ORM kullanımı ve input sanitization bu saldırıları büyük ölçüde engeller.

Cross-Site Scripting (XSS)

XSS, kötü niyetli scriptlerin kullanıcı tarayıcısında çalıştırılmasına olanak tanır. Output encoding, Content Security Policy (CSP) header'ları ve React gibi framework'lerin otomatik escape mekanizmaları XSS'e karşı güçlü savunma hatları oluşturur.

Authentication ve Session Yönetimi

Zayıf parola politikaları, güvensiz session yönetimi ve eksik brute-force koruması sık karşılaşılan sorunlardır. Bcrypt ile parola hashleme, JWT token yönetimi, rate limiting ve multi-factor authentication güvenliği katmanlı olarak artırır.

CSRF ve CORS

Cross-Site Request Forgery (CSRF) saldırıları, kullanıcının oturumunu kötüye kullanarak yetkisiz işlemler yapar. CSRF token'ları, SameSite cookie ayarları ve doğru CORS yapılandırması bu tehdide karşı koruma sağlar.

Güvenlik bir özellik değil, bir süreçtir. Uygulamanızı geliştirirken güvenliği her aşamada düşünün.`,
    tags: ["Security", "OWASP", "Web Development"],
    status: "published",
  },
  {
    title: "TypeScript'e Geçiş: Neden ve Nasıl?",
    content: `TypeScript, JavaScript'in üzerine statik tip sistemi ekleyen bir süperset olarak, büyük ölçekli projelerde güvenilirliği ve geliştirici deneyimini önemli ölçüde artırır. Peki projenizi TypeScript'e taşımak ne zaman mantıklıdır?

TypeScript'in Avantajları

Derleme zamanı hata yakalama, gelişmiş IDE desteği (otomatik tamamlama, refactoring), kendini belgeleyen kod ve büyük ekiplerde tutarlılık TypeScript'in en önemli avantajlarıdır. Tip sistemi sayesinde runtime hataları derleme aşamasında yakalanır.

Kademeli Geçiş Stratejisi

Mevcut bir JavaScript projesini TypeScript'e geçirmenin en sağlıklı yolu kademeli geçiştir. tsconfig.json'da allowJs: true ayarı ile JS ve TS dosyalarını bir arada kullanabilirsiniz. Önce kritik modülleri, sonra diğerlerini dönüştürün.

Tip Tanımlamaları

Interface'ler, type alias'lar, generic'ler ve utility type'lar TypeScript'in güçlü tip sisteminin temel taşlarıdır. Partial, Pick, Omit gibi utility type'lar mevcut tipleri dönüştürerek kod tekrarını azaltır.

Yaygın Hatalar

"any" tipini aşırı kullanmak, TypeScript'in faydalarını sıfırlar. Strict mode'u etkinleştirin, "unknown" tipini "any" yerine tercih edin ve tip güvenliğinden ödün vermeyin.

TypeScript, kısa vadede biraz ekstra efor gerektirse de uzun vadede hata oranını düşürür, refactoring güvenini artırır ve ekip verimliliğini yükseltir.`,
    tags: ["TypeScript", "JavaScript", "Programming"],
    status: "published",
  },
  {
    title: "Docker ile Konteynerizasyon: Başlangıç Rehberi",
    content: `Docker, uygulamaları konteynerler içinde paketleyerek "benim makinemde çalışıyor" problemini ortadan kaldıran devrimsel bir teknolojidir. Geliştirmeden üretime kadar tutarlı bir ortam sağlar.

Konteyner vs Sanal Makine

Konteynerler, sanal makinelerden farklı olarak işletim sistemi çekirdeğini paylaşır. Bu sayede çok daha hafif, hızlı başlayan ve kaynak dostu bir izolasyon sunarlar. Bir sanal makine dakikalarca sürebilecek başlatma işlemi, bir konteyner için saniyeler alır.

Dockerfile Yazımı

İyi bir Dockerfile, multi-stage build kullanır, gereksiz dosyaları .dockerignore ile hariç tutar, layer caching'den faydalanır ve minimum boyutlu base image'lar tercih eder. Alpine tabanlı image'lar boyutu önemli ölçüde azaltır.

Docker Compose

Çoklu konteyner uygulamalarını yönetmek için Docker Compose vazgeçilmezdir. Veritabanı, backend, frontend ve diğer servisleri tek bir docker-compose.yml dosyasıyla tanımlayıp, tek komutla ayağa kaldırabilirsiniz.

Best Practices

Root kullanıcıyla çalışmaktan kaçının, hassas verileri environment variable olarak geçirin, health check'ler tanımlayın ve image'larınızı düzenli olarak güncelleyin. Güvenlik taramalarını CI/CD pipeline'ınıza entegre edin.

Docker, modern yazılım geliştirmenin standart aracı haline gelmiştir. Öğrenme eğrisi başlangıçta dik olabilir, ancak sağladığı tutarlılık ve verimlilik bu yatırıma değer.`,
    tags: ["Docker", "DevOps", "Containerization"],
    status: "published",
  },
  {
    title: "Responsive Tasarım: Mobile-First Yaklaşım",
    content: `Dünya genelinde internet trafiğinin yarısından fazlası mobil cihazlardan gelirken, responsive tasarım artık bir tercih değil zorunluluktur. Mobile-first yaklaşımı, bu gerçekliği tasarım sürecinin merkezine koyar.

Mobile-First Nedir?

Mobile-first, tasarım ve geliştirme sürecine en küçük ekrandan başlayıp, büyük ekranlara doğru genişletme yaklaşımıdır. Bu strateji, içeriğin önceliklendirilmesini zorunlu kılar ve performansı doğal olarak iyileştirir.

Media Query Stratejisi

min-width tabanlı media query'ler mobile-first yaklaşımın temelini oluşturur. Temel stiller mobil için yazılır, ardından @media (min-width: 768px) gibi breakpoint'ler ile tablet ve masaüstü stilleri eklenir.

Fluid Typography ve Spacing

clamp() fonksiyonu ve viewport birimleri ile tipografi ve boşluklar ekran boyutuna göre akışkan biçimde ölçeklenir. Bu yaklaşım, sabit breakpoint'lere bağımlılığı azaltarak her ekran boyutunda optimal görünüm sağlar.

Performans Optimizasyonu

Responsive image'lar (srcset, picture), lazy loading, kritik CSS ve conditional loading mobil performansı artıran temel tekniklerdir. Mobil kullanıcılar genellikle daha yavaş bağlantılar kullandığından performans kritik öneme sahiptir.

Mobile-first yaklaşım, sadece teknik bir karar değil, kullanıcı odaklı bir tasarım felsefesidir.`,
    tags: ["CSS", "Responsive", "UI/UX"],
    status: "published",
  },
  {
    title: "Clean Code: Okunabilir Kod Yazma Sanatı",
    content: `Kod yazmak, başkalarının — ve gelecekteki kendinizin — okuyabileceği bir metin üretmektir. Clean Code prensipleri, kodunuzu anlaşılır, bakımı kolay ve güvenilir hale getirmenin yol haritasıdır.

Anlamlı İsimlendirme

Değişken, fonksiyon ve sınıf isimleri niyeti açıkça ifade etmelidir. "d" yerine "elapsedDays", "getData" yerine "fetchActiveUsers" kullanmak kodun kendi kendini belgelemesini sağlar. İyi isimler, yorum ihtiyacını büyük ölçüde azaltır.

Küçük Fonksiyonlar

Her fonksiyon tek bir iş yapmalıdır ve bunu iyi yapmalıdır. 20 satırı aşan fonksiyonlar genellikle parçalanabilir. Küçük, odaklanmış fonksiyonlar hem test edilebilirliği hem de yeniden kullanılabilirliği artırır.

DRY ve KISS Prensipleri

Don't Repeat Yourself (DRY) ve Keep It Simple, Stupid (KISS) prensipleri clean code'un temelini oluşturur. Tekrarlayan kodu soyutlayın, ancak gereksiz karmaşıklıktan kaçının. Bazen basit bir çözüm, akıllıca görünen karmaşık bir çözümden daha değerlidir.

Code Review Kültürü

Düzenli code review'lar, kod kalitesini artırmanın en etkili yollarından biridir. Yapıcı geri bildirim vermek, bilgi paylaşımını teşvik etmek ve tutarlı standartlar oluşturmak ekip genelinde code quality'yi yükseltir.

Clean code yazmak bir alışkanlıktır. Her gün biraz daha iyi kod yazma hedefi, zamanla büyük fark yaratır.`,
    tags: ["Clean Code", "Best Practices", "Programming"],
    status: "published",
  },
  {
    title: "CI/CD Pipeline Kurulumu: GitHub Actions ile Otomasyon",
    content: `CI/CD (Continuous Integration / Continuous Deployment), modern yazılım geliştirmenin bel kemiğidir. GitHub Actions ile ücretsiz ve güçlü bir otomasyon pipeline'ı kurarak kod kalitesini artırabilir ve deployment sürecinizi hızlandırabilirsiniz.

Continuous Integration

CI, her kod değişikliğinin otomatik olarak test edilmesi ve doğrulanması sürecidir. Linting, unit testler, integration testler ve build kontrolü CI pipeline'ının temel adımlarıdır. Sorunlar erken aşamada yakalanarak maliyetli hataların önüne geçilir.

GitHub Actions Yapısı

Workflow dosyaları .github/workflows/ dizininde YAML formatında tanımlanır. Trigger'lar (push, pull_request), job'lar, step'ler ve action'lar workflow'un temel bileşenleridir. Marketplace'teki hazır action'lar geliştirme süresini kısaltır.

Continuous Deployment

CD, başarılı testlerden geçen kodun otomatik olarak hedef ortama deploy edilmesi sürecidir. Staging ve production ortamları için ayrı pipeline'lar tanımlayarak güvenli bir deployment akışı oluşturabilirsiniz.

Secrets ve Environment Yönetimi

API anahtarları, veritabanı bağlantı bilgileri ve diğer hassas veriler GitHub Secrets üzerinden güvenle yönetilir. Her ortam için ayrı secret'lar tanımlayarak güvenliği katmanlı hale getirin.

CI/CD, başlangıçta kurulum eforu gerektirse de uzun vadede ekip verimliliğini ve yazılım kalitesini dramatik şekilde artırır.`,
    tags: ["CI/CD", "GitHub Actions", "DevOps"],
    status: "published",
  },
  {
    title: "Yapay Zeka ve Yazılım Geliştirmenin Geleceği",
    content: `Yapay zeka, yazılım geliştirme dünyasını hızla dönüştürüyor. AI destekli kod asistanları, otomatik test üretimi ve akıllı hata tespiti gibi araçlar geliştiricilerin üretkenliğini katladı. Peki bu dönüşüm nereye gidiyor?

AI Destekli Kodlama

GitHub Copilot, Cursor ve benzeri araçlar, kod tamamlama, refactoring önerileri ve hata çözümlerinde geliştiricilere yardımcı oluyor. Bu araçlar tekrarlayan görevleri otomatikleştirerek geliştiricilerin yaratıcı problem çözmeye odaklanmasını sağlıyor.

Otomatik Test Üretimi

AI, mevcut kodu analiz ederek edge case'leri tespit edebilir ve kapsamlı test senaryoları üretebilir. Bu, test coverage'ını artırırken geliştiricilerin test yazma yükünü azaltır.

Kod İnceleme ve Güvenlik

AI tabanlı kod inceleme araçları, güvenlik açıklarını, performans sorunlarını ve code smell'leri otomatik olarak tespit edebilir. Bu araçlar, insan reviewerlerin gözünden kaçabilecek sorunları yakalar.

Geliştiricinin Rolü Değişiyor

AI, geliştiricilerin yerini almıyor ancak rolünü dönüştürüyor. Rutin kodlama görevleri otomasyona geçerken, mimari tasarım, problem analizi ve kullanıcı deneyimi gibi yüksek seviye beceriler daha da değerli hale geliyor.

AI araçlarını etkin kullanan geliştiriciler, bu dönüşümün kazananları olacak. Önemli olan AI'yı bir rakip değil, güçlü bir iş ortağı olarak görmektir.`,
    tags: ["AI", "Technology", "Future"],
    status: "published",
  },
  {
    title: "Web Performans Optimizasyonu: Core Web Vitals",
    content: `Google'ın Core Web Vitals metrikleri, kullanıcı deneyiminin ölçülebilir standartlarını belirledi. LCP, INP ve CLS değerlerini optimize etmek hem kullanıcı memnuniyetini hem de SEO sıralamalarınızı doğrudan etkiler.

Largest Contentful Paint (LCP)

LCP, sayfadaki en büyük içerik öğesinin yüklenme süresini ölçer. 2.5 saniyenin altında olmalıdır. Image optimizasyonu, CDN kullanımı, server-side rendering ve kritik kaynakların önceliklendirilmesi LCP'yi iyileştirir.

Interaction to Next Paint (INP)

INP, kullanıcı etkileşimlerine verilen yanıt süresini ölçer. 200ms altında olmalıdır. Ana thread'i bloklamaktan kaçınmak, uzun görevleri parçalamak ve Web Worker'lar kullanmak INP'yi optimize eder.

Cumulative Layout Shift (CLS)

CLS, sayfadaki beklenmedik layout kaymalarını ölçer. 0.1 altında olmalıdır. Image ve video boyutlarını önceden belirtmek, dinamik içeriklere alan ayırmak ve font yükleme stratejileri CLS'yi minimize eder.

Ölçme ve İzleme

Lighthouse, PageSpeed Insights ve Chrome DevTools performans metriklerini ölçmek için temel araçlardır. Real User Monitoring (RUM) ile gerçek kullanıcı verilerini toplayarak optimizasyon kararlarınızı veriyle destekleyin.

Web performansı bir kerelik bir görev değil, sürekli bir iyileştirme sürecidir. Düzenli ölçüm ve optimizasyon ile kullanıcılarınıza en iyi deneyimi sunun.`,
    tags: ["Performance", "SEO", "Web Development"],
    status: "published",
  },
];

const seedPosts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to database");

    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      console.error("Admin user not found. Run seedAdmin first.");
      await mongoose.disconnect();
      process.exit(1);
    }

    const existingCount = await Post.countDocuments({ author: admin._id });
    if (existingCount >= 14) {
      console.log(`Admin already has ${existingCount} posts. Skipping seed.`);
      await mongoose.disconnect();
      process.exit(0);
    }

    let created = 0;
    for (const postData of posts) {
      const existing = await Post.findOne({ title: postData.title });
      if (existing) {
        console.log(`Skipping duplicate: "${postData.title}"`);
        continue;
      }

      await Post.create({ ...postData, author: admin._id });
      created++;
      console.log(`Created: "${postData.title}"`);
    }

    console.log(`\nSeed complete: ${created} posts created for ${admin.email}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed posts failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedPosts();
