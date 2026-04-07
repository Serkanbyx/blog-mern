const mongoose = require("mongoose");
const { MONGO_URI } = require("../config/env");
const User = require("../models/User");
const Post = require("../models/Post");

const posts = [
  {
    title: "JavaScript'te Async/Await Kullanımı ve En İyi Pratikler",
    content: `<p>Modern JavaScript geliştirmede <strong>async/await</strong>, asenkron işlemleri yönetmenin en okunabilir ve güçlü yoludur. Callback hell ve karmaşık Promise zincirlerinin yerini alan bu yapı, kodunuzu senkron görünümlü hale getirirken tüm asenkron avantajları korur.</p>

<h2>Async/Await Nedir?</h2>
<p>ES2017 ile tanıtılan async/await, Promise tabanlı asenkron kodun yazılmasını kolaylaştıran bir sözdizimi şekeridir. <code>async</code> anahtar kelimesi bir fonksiyonu asenkron olarak işaretlerken, <code>await</code> bir Promise'in çözülmesini bekler.</p>

<h2>Hata Yönetimi</h2>
<p>Async/await ile hata yönetimi <code>try/catch</code> blokları üzerinden yapılır. Bu yaklaşım, senkron kodda alışkın olduğumuz hata yakalama mekanizmasının aynısıdır. Her zaman <code>catch</code> bloğunda anlamlı hata mesajları üretmeye özen gösterin.</p>

<h2>Paralel İşlemler</h2>
<p>Birbirinden bağımsız asenkron işlemleri <code>Promise.all()</code> ile paralel çalıştırmak performansı önemli ölçüde artırır. Sıralı await kullanmak yerine, bağımsız işlemleri gruplayarak toplam bekleme süresini en uzun işlem süresine düşürebilirsiniz.</p>

<p>Async/await, JavaScript ekosisteminin vazgeçilmez bir parçası haline gelmiştir. Doğru kullanıldığında kodunuzun hem okunabilirliğini hem de bakım kolaylığını büyük ölçüde artırır.</p>`,
    tags: ["JavaScript", "Async", "Web Development"],
    status: "published",
  },
  {
    title: "React Hooks ile Modern State Yönetimi",
    content: `<p>React 16.8 ile birlikte gelen <strong>Hooks</strong>, fonksiyonel bileşenlerde state ve lifecycle yönetimini mümkün kılarak React geliştirme paradigmasını kökten değiştirdi. Artık class bileşenlerine ihtiyaç duymadan güçlü ve yeniden kullanılabilir mantık yazabiliyoruz.</p>

<h2>useState ve useEffect</h2>
<p><code>useState</code>, bileşen içinde lokal state tutmanın en basit yoludur. <code>useEffect</code> ise side effect'leri (API çağrıları, abonelikler, DOM manipülasyonu) yönetmek için kullanılır. Bu iki hook, çoğu bileşen ihtiyacını karşılar.</p>

<h2>Custom Hooks</h2>
<p>Custom hook'lar, tekrarlayan mantığı soyutlayarak bileşenler arasında paylaşmanızı sağlar. Örneğin, form yönetimi, API çağrıları veya local storage işlemleri için özel hook'lar yazabilirsiniz. Bu yaklaşım DRY prensibine uygun, test edilebilir ve modüler bir mimari sunar.</p>

<h2>useReducer ile Karmaşık State</h2>
<p>Birbirine bağlı birden fazla state değişkeni olduğunda <code>useReducer</code> daha tahmin edilebilir bir yönetim sunar. Redux benzeri bir yapıyı bileşen seviyesinde uygulayarak karmaşık state geçişlerini tek bir yerden kontrol edebilirsiniz.</p>

<p>Hooks, React'in geleceğidir. Fonksiyonel programlama prensiplerini benimseyerek daha temiz, test edilebilir ve bakımı kolay uygulamalar geliştirmek artık her zamankinden daha kolay.</p>`,
    tags: ["React", "Hooks", "Frontend"],
    status: "published",
  },
  {
    title: "Node.js ile RESTful API Tasarım Rehberi",
    content: `<p>Başarılı bir web uygulamasının temelinde iyi tasarlanmış bir <strong>API</strong> yatar. RESTful mimari prensiplerini doğru uygulayarak ölçeklenebilir, anlaşılır ve bakımı kolay API'ler oluşturabilirsiniz.</p>

<h2>REST Prensipleri</h2>
<p>REST (Representational State Transfer), HTTP protokolünü temel alan bir mimari stildir. Kaynakları (resources) URL'ler ile temsil eder ve HTTP metotlarını (GET, POST, PUT, DELETE) işlem türlerini belirtmek için kullanır. Stateless yapısı sayesinde her istek kendi içinde bağımsızdır.</p>

<h2>URL Tasarımı</h2>
<p>İyi bir URL yapısı, API'nizin anlaşılabilirliğini doğrudan etkiler. İsimlendirmede çoğul isimler kullanın (<code>/users</code>, <code>/posts</code>), fiillerden kaçının ve hiyerarşik ilişkileri URL'de yansıtın (<code>/users/:id/posts</code>).</p>

<h2>Hata Yönetimi ve Durum Kodları</h2>
<p>HTTP durum kodlarını doğru kullanmak API'nizin profesyonelliğini artırır. 200 serisi başarı, 400 serisi istemci hataları, 500 serisi sunucu hataları için kullanılır. Her hata yanıtında tutarlı bir format ve açıklayıcı mesajlar sunun.</p>

<h2>Güvenlik</h2>
<p>Rate limiting, input validation, CORS yapılandırması ve JWT tabanlı authentication API güvenliğinin temel taşlarıdır. Hassas verileri asla URL parametrelerinde taşımayın ve tüm girdileri sunucu tarafında doğrulayın.</p>

<p>İyi tasarlanmış bir API, yalnızca bugünün ihtiyaçlarını karşılamakla kalmaz, gelecekteki değişikliklere de kolayca adapte olabilir.</p>`,
    tags: ["Node.js", "API", "Backend"],
    status: "published",
  },
  {
    title: "MongoDB ile Veritabanı Modelleme Stratejileri",
    content: `<p><strong>MongoDB</strong>, NoSQL veritabanları arasında en popüler olanlardan biridir. Esnek şema yapısı ve doküman tabanlı mimarisi, modern uygulamalar için güçlü bir temel sunar. Ancak bu esneklik, dikkatli bir modelleme stratejisi gerektirir.</p>

<h2>Embedding vs Referencing</h2>
<p>MongoDB'de veri modellemenin iki temel yaklaşımı vardır: verileri iç içe gömmek (embedding) veya referans kullanmak. Sık birlikte okunan ve güncellenen veriler için embedding, bağımsız yaşam döngüsüne sahip veriler için referencing tercih edilmelidir.</p>

<h2>İndeksleme</h2>
<p>Doğru indeksleme, sorgu performansını dramatik şekilde artırır. Sık sorgulanan alanlar, sıralama kriterleri ve filtreleme koşulları için indeks oluşturun. Ancak gereksiz indekslerden kaçının çünkü yazma performansını olumsuz etkilerler.</p>

<h2>Aggregation Pipeline</h2>
<p>MongoDB'nin aggregation framework'ü, karmaşık veri dönüşümlerini ve analizlerini veritabanı seviyesinde gerçekleştirmenizi sağlar. <code>$match</code>, <code>$group</code>, <code>$lookup</code> gibi stage'ler ile güçlü sorgular yazabilirsiniz.</p>

<p>Başarılı bir MongoDB modelleme stratejisi, uygulamanızın okuma/yazma paternlerini, veri ilişkilerini ve ölçeklenme ihtiyaçlarını dikkate almalıdır.</p>`,
    tags: ["MongoDB", "Database", "NoSQL"],
    status: "published",
  },
  {
    title: "CSS Grid ve Flexbox: Ne Zaman Hangisini Kullanmalı?",
    content: `<p>Modern CSS layout sistemleri olan <strong>Grid</strong> ve <strong>Flexbox</strong>, web tasarımında devrim yarattı. Her ikisi de güçlü araçlardır, ancak farklı senaryolarda parlarlar. Doğru aracı seçmek, hem geliştirme hızınızı hem de kodunuzun bakım kolaylığını etkiler.</p>

<h2>Flexbox: Tek Boyutlu Layout</h2>
<p>Flexbox, öğeleri tek bir eksen boyunca (yatay veya dikey) hizalamak için idealdir. Navigasyon menüleri, kart satırları, form elemanları ve merkezleme işlemleri Flexbox'ın en güçlü olduğu alanlardır. <code>justify-content</code> ve <code>align-items</code> ile hızlıca profesyonel hizalamalar yapabilirsiniz.</p>

<h2>CSS Grid: İki Boyutlu Layout</h2>
<p>Grid, hem satır hem sütun bazında kontrol gerektiren karmaşık layout'lar için tasarlanmıştır. Sayfa düzenleri, dashboard'lar, galeri görünümleri ve asimetrik tasarımlar Grid ile çok daha kolay uygulanır. <code>grid-template-areas</code> ile görsel olarak layout'unuzu tanımlayabilirsiniz.</p>

<h2>Birlikte Kullanım</h2>
<p>En güçlü yaklaşım, Grid ve Flexbox'ı birlikte kullanmaktır. Genel sayfa yapısını Grid ile oluştururken, bileşen içi hizalamalar için Flexbox tercih edebilirsiniz. Bu hibrit yaklaşım, hem esneklik hem de kontrol sağlar.</p>

<p>Sonuç olarak, layout ihtiyacınız tek boyutluysa Flexbox, iki boyutluysa Grid kullanın. İkisini birlikte kullandığınızda CSS'in gerçek gücünü keşfedeceksiniz.</p>`,
    tags: ["CSS", "Frontend", "Web Design"],
    status: "published",
  },
  {
    title: "Git ile Etkili Versiyon Kontrolü ve Branch Stratejileri",
    content: `<p><strong>Git</strong>, yazılım geliştirmenin olmazsa olmazıdır. Ancak Git'i gerçekten etkili kullanmak, temel komutları bilmenin ötesinde iyi bir branch stratejisi ve iş akışı gerektirir.</p>

<h2>Branch Stratejileri</h2>
<p>Gitflow, GitHub Flow ve Trunk-Based Development en yaygın branch stratejileridir. Küçük ekipler için GitHub Flow'un basitliği ideal olabilirken, büyük projeler Gitflow'un yapısal avantajlarından faydalanabilir. Önemli olan ekibinize uygun stratejiyi seçmektir.</p>

<h2>Anlamlı Commit Mesajları</h2>
<p>İyi commit mesajları, projenin geçmişini okunabilir kılar. Conventional Commits formatı (<code>feat:</code>, <code>fix:</code>, <code>refactor:</code>) hem tutarlılık sağlar hem de otomatik changelog oluşturmayı mümkün kılar. Her commit tek bir mantıksal değişikliği kapsamalıdır.</p>

<h2>Rebase vs Merge</h2>
<p>Feature branch'leri ana branch'e entegre ederken rebase temiz bir geçmiş sunarken, merge commit'leri branch tarihçesini korur. Ekip içinde tutarlı bir yaklaşım benimsemek karışıklığı önler.</p>

<h2>Conflict Çözümü</h2>
<p>Merge conflict'leri kaçınılmazdır. Düzenli olarak ana branch'ten güncellemeleri almak, küçük ve odaklı commit'ler yapmak ve iyi iletişim kurmak conflict'leri minimize eder.</p>

<p>Git, bir araçtan çok bir disiplindir. İyi Git pratikleri, ekip verimliliğini ve kod kalitesini doğrudan etkiler.</p>`,
    tags: ["Git", "DevOps", "Version Control"],
    status: "published",
  },
  {
    title: "Web Uygulamalarında Güvenlik: OWASP Top 10",
    content: `<p>Web güvenliği, her geliştiricinin sorumluluğudur. <strong>OWASP Top 10</strong>, web uygulamalarındaki en kritik güvenlik risklerini sıralar ve her geliştirici bu tehditleri bilmeli, önlem almalıdır.</p>

<h2>Injection Saldırıları</h2>
<p>SQL Injection, NoSQL Injection ve Command Injection, kullanıcı girdilerinin doğrudan sorgulara dahil edilmesiyle gerçekleşir. Parametreli sorgular, ORM kullanımı ve input sanitization bu saldırıları büyük ölçüde engeller.</p>

<h2>Cross-Site Scripting (XSS)</h2>
<p>XSS, kötü niyetli scriptlerin kullanıcı tarayıcısında çalıştırılmasına olanak tanır. Output encoding, Content Security Policy (CSP) header'ları ve React gibi framework'lerin otomatik escape mekanizmaları XSS'e karşı güçlü savunma hatları oluşturur.</p>

<h2>Authentication ve Session Yönetimi</h2>
<p>Zayıf parola politikaları, güvensiz session yönetimi ve eksik brute-force koruması sık karşılaşılan sorunlardır. Bcrypt ile parola hashleme, JWT token yönetimi, rate limiting ve multi-factor authentication güvenliği katmanlı olarak artırır.</p>

<h2>CSRF ve CORS</h2>
<p>Cross-Site Request Forgery (CSRF) saldırıları, kullanıcının oturumunu kötüye kullanarak yetkisiz işlemler yapar. CSRF token'ları, SameSite cookie ayarları ve doğru CORS yapılandırması bu tehdide karşı koruma sağlar.</p>

<p>Güvenlik bir özellik değil, bir süreçtir. Uygulamanızı geliştirirken güvenliği her aşamada düşünün.</p>`,
    tags: ["Security", "OWASP", "Web Development"],
    status: "published",
  },
  {
    title: "TypeScript'e Geçiş: Neden ve Nasıl?",
    content: `<p><strong>TypeScript</strong>, JavaScript'in üzerine statik tip sistemi ekleyen bir süperset olarak, büyük ölçekli projelerde güvenilirliği ve geliştirici deneyimini önemli ölçüde artırır. Peki projenizi TypeScript'e taşımak ne zaman mantıklıdır?</p>

<h2>TypeScript'in Avantajları</h2>
<p>Derleme zamanı hata yakalama, gelişmiş IDE desteği (otomatik tamamlama, refactoring), kendini belgeleyen kod ve büyük ekiplerde tutarlılık TypeScript'in en önemli avantajlarıdır. Tip sistemi sayesinde runtime hataları derleme aşamasında yakalanır.</p>

<h2>Kademeli Geçiş Stratejisi</h2>
<p>Mevcut bir JavaScript projesini TypeScript'e geçirmenin en sağlıklı yolu kademeli geçiştir. <code>tsconfig.json</code>'da <code>allowJs: true</code> ayarı ile JS ve TS dosyalarını bir arada kullanabilirsiniz. Önce kritik modülleri, sonra diğerlerini dönüştürün.</p>

<h2>Tip Tanımlamaları</h2>
<p>Interface'ler, type alias'lar, generic'ler ve utility type'lar TypeScript'in güçlü tip sisteminin temel taşlarıdır. <code>Partial</code>, <code>Pick</code>, <code>Omit</code> gibi utility type'lar mevcut tipleri dönüştürerek kod tekrarını azaltır.</p>

<h2>Yaygın Hatalar</h2>
<p><code>any</code> tipini aşırı kullanmak, TypeScript'in faydalarını sıfırlar. Strict mode'u etkinleştirin, <code>unknown</code> tipini <code>any</code> yerine tercih edin ve tip güvenliğinden ödün vermeyin.</p>

<p>TypeScript, kısa vadede biraz ekstra efor gerektirse de uzun vadede hata oranını düşürür, refactoring güvenini artırır ve ekip verimliliğini yükseltir.</p>`,
    tags: ["TypeScript", "JavaScript", "Programming"],
    status: "published",
  },
  {
    title: "Docker ile Konteynerizasyon: Başlangıç Rehberi",
    content: `<p><strong>Docker</strong>, uygulamaları konteynerler içinde paketleyerek "benim makinemde çalışıyor" problemini ortadan kaldıran devrimsel bir teknolojidir. Geliştirmeden üretime kadar tutarlı bir ortam sağlar.</p>

<h2>Konteyner vs Sanal Makine</h2>
<p>Konteynerler, sanal makinelerden farklı olarak işletim sistemi çekirdeğini paylaşır. Bu sayede çok daha hafif, hızlı başlayan ve kaynak dostu bir izolasyon sunarlar. Bir sanal makine dakikalarca sürebilecek başlatma işlemi, bir konteyner için saniyeler alır.</p>

<h2>Dockerfile Yazımı</h2>
<p>İyi bir Dockerfile, multi-stage build kullanır, gereksiz dosyaları <code>.dockerignore</code> ile hariç tutar, layer caching'den faydalanır ve minimum boyutlu base image'lar tercih eder. Alpine tabanlı image'lar boyutu önemli ölçüde azaltır.</p>

<h2>Docker Compose</h2>
<p>Çoklu konteyner uygulamalarını yönetmek için Docker Compose vazgeçilmezdir. Veritabanı, backend, frontend ve diğer servisleri tek bir <code>docker-compose.yml</code> dosyasıyla tanımlayıp, tek komutla ayağa kaldırabilirsiniz.</p>

<h2>Best Practices</h2>
<p>Root kullanıcıyla çalışmaktan kaçının, hassas verileri environment variable olarak geçirin, health check'ler tanımlayın ve image'larınızı düzenli olarak güncelleyin. Güvenlik taramalarını CI/CD pipeline'ınıza entegre edin.</p>

<p>Docker, modern yazılım geliştirmenin standart aracı haline gelmiştir. Öğrenme eğrisi başlangıçta dik olabilir, ancak sağladığı tutarlılık ve verimlilik bu yatırıma değer.</p>`,
    tags: ["Docker", "DevOps", "Containerization"],
    status: "published",
  },
  {
    title: "Responsive Tasarım: Mobile-First Yaklaşım",
    content: `<p>Dünya genelinde internet trafiğinin yarısından fazlası mobil cihazlardan gelirken, <strong>responsive tasarım</strong> artık bir tercih değil zorunluluktur. Mobile-first yaklaşımı, bu gerçekliği tasarım sürecinin merkezine koyar.</p>

<h2>Mobile-First Nedir?</h2>
<p>Mobile-first, tasarım ve geliştirme sürecine en küçük ekrandan başlayıp, büyük ekranlara doğru genişletme yaklaşımıdır. Bu strateji, içeriğin önceliklendirilmesini zorunlu kılar ve performansı doğal olarak iyileştirir.</p>

<h2>Media Query Stratejisi</h2>
<p><code>min-width</code> tabanlı media query'ler mobile-first yaklaşımın temelini oluşturur. Temel stiller mobil için yazılır, ardından <code>@media (min-width: 768px)</code> gibi breakpoint'ler ile tablet ve masaüstü stilleri eklenir.</p>

<h2>Fluid Typography ve Spacing</h2>
<p><code>clamp()</code> fonksiyonu ve viewport birimleri ile tipografi ve boşluklar ekran boyutuna göre akışkan biçimde ölçeklenir. Bu yaklaşım, sabit breakpoint'lere bağımlılığı azaltarak her ekran boyutunda optimal görünüm sağlar.</p>

<h2>Performans Optimizasyonu</h2>
<p>Responsive image'lar (<code>srcset</code>, <code>picture</code>), lazy loading, kritik CSS ve conditional loading mobil performansı artıran temel tekniklerdir. Mobil kullanıcılar genellikle daha yavaş bağlantılar kullandığından performans kritik öneme sahiptir.</p>

<p>Mobile-first yaklaşım, sadece teknik bir karar değil, kullanıcı odaklı bir tasarım felsefesidir.</p>`,
    tags: ["CSS", "Responsive", "UI/UX"],
    status: "published",
  },
  {
    title: "Clean Code: Okunabilir Kod Yazma Sanatı",
    content: `<p>Kod yazmak, başkalarının (ve gelecekteki kendinizin) okuyabileceği bir metin üretmektir. <strong>Clean Code</strong> prensipleri, kodunuzu anlaşılır, bakımı kolay ve güvenilir hale getirmenin yol haritasıdır.</p>

<h2>Anlamlı İsimlendirme</h2>
<p>Değişken, fonksiyon ve sınıf isimleri niyeti açıkça ifade etmelidir. <code>d</code> yerine <code>elapsedDays</code>, <code>getData</code> yerine <code>fetchActiveUsers</code> kullanmak kodun kendi kendini belgelemesini sağlar. İyi isimler, yorum ihtiyacını büyük ölçüde azaltır.</p>

<h2>Küçük Fonksiyonlar</h2>
<p>Her fonksiyon tek bir iş yapmalıdır ve bunu iyi yapmalıdır. 20 satırı aşan fonksiyonlar genellikle parçalanabilir. Küçük, odaklanmış fonksiyonlar hem test edilebilirliği hem de yeniden kullanılabilirliği artırır.</p>

<h2>DRY ve KISS Prensipleri</h2>
<p>Don't Repeat Yourself (DRY) ve Keep It Simple, Stupid (KISS) prensipleri clean code'un temelini oluşturur. Tekrarlayan kodu soyutlayın, ancak gereksiz karmaşıklıktan kaçının. Bazen basit bir çözüm, akıllıca görünen karmaşık bir çözümden daha değerlidir.</p>

<h2>Code Review Kültürü</h2>
<p>Düzenli code review'lar, kod kalitesini artırmanın en etkili yollarından biridir. Yapıcı geri bildirim vermek, bilgi paylaşımını teşvik etmek ve tutarlı standartlar oluşturmak ekip genelinde code quality'yi yükseltir.</p>

<p>Clean code yazmak bir alışkanlıktır. Her gün biraz daha iyi kod yazma hedefi, zamanla büyük fark yaratır.</p>`,
    tags: ["Clean Code", "Best Practices", "Programming"],
    status: "published",
  },
  {
    title: "CI/CD Pipeline Kurulumu: GitHub Actions ile Otomasyon",
    content: `<p><strong>CI/CD</strong> (Continuous Integration / Continuous Deployment), modern yazılım geliştirmenin bel kemiğidir. GitHub Actions ile ücretsiz ve güçlü bir otomasyon pipeline'ı kurarak kod kalitesini artırabilir ve deployment sürecinizi hızlandırabilirsiniz.</p>

<h2>Continuous Integration</h2>
<p>CI, her kod değişikliğinin otomatik olarak test edilmesi ve doğrulanması sürecidir. Linting, unit testler, integration testler ve build kontrolü CI pipeline'ının temel adımlarıdır. Sorunlar erken aşamada yakalanarak maliyetli hataların önüne geçilir.</p>

<h2>GitHub Actions Yapısı</h2>
<p>Workflow dosyaları <code>.github/workflows/</code> dizininde YAML formatında tanımlanır. Trigger'lar (push, pull_request), job'lar, step'ler ve action'lar workflow'un temel bileşenleridir. Marketplace'teki hazır action'lar geliştirme süresini kısaltır.</p>

<h2>Continuous Deployment</h2>
<p>CD, başarılı testlerden geçen kodun otomatik olarak hedef ortama deploy edilmesi sürecidir. Staging ve production ortamları için ayrı pipeline'lar tanımlayarak güvenli bir deployment akışı oluşturabilirsiniz.</p>

<h2>Secrets ve Environment Yönetimi</h2>
<p>API anahtarları, veritabanı bağlantı bilgileri ve diğer hassas veriler GitHub Secrets üzerinden güvenle yönetilir. Her ortam için ayrı secret'lar tanımlayarak güvenliği katmanlı hale getirin.</p>

<p>CI/CD, başlangıçta kurulum eforu gerektirse de uzun vadede ekip verimliliğini ve yazılım kalitesini dramatik şekilde artırır.</p>`,
    tags: ["CI/CD", "GitHub Actions", "DevOps"],
    status: "published",
  },
  {
    title: "Yapay Zeka ve Yazılım Geliştirmenin Geleceği",
    content: `<p><strong>Yapay zeka</strong>, yazılım geliştirme dünyasını hızla dönüştürüyor. AI destekli kod asistanları, otomatik test üretimi ve akıllı hata tespiti gibi araçlar geliştiricilerin üretkenliğini katladı. Peki bu dönüşüm nereye gidiyor?</p>

<h2>AI Destekli Kodlama</h2>
<p>GitHub Copilot, Cursor ve benzeri araçlar, kod tamamlama, refactoring önerileri ve hata çözümlerinde geliştiricilere yardımcı oluyor. Bu araçlar tekrarlayan görevleri otomatikleştirerek geliştiricilerin yaratıcı problem çözmeye odaklanmasını sağlıyor.</p>

<h2>Otomatik Test Üretimi</h2>
<p>AI, mevcut kodu analiz ederek edge case'leri tespit edebilir ve kapsamlı test senaryoları üretebilir. Bu, test coverage'ını artırırken geliştiricilerin test yazma yükünü azaltır.</p>

<h2>Kod İnceleme ve Güvenlik</h2>
<p>AI tabanlı kod inceleme araçları, güvenlik açıklarını, performans sorunlarını ve code smell'leri otomatik olarak tespit edebilir. Bu araçlar, insan reviewerlerin gözünden kaçabilecek sorunları yakalar.</p>

<h2>Geliştiricinin Rolü Değişiyor</h2>
<p>AI, geliştiricilerin yerini almıyor ancak rolünü dönüştürüyor. Rutin kodlama görevleri otomasyona geçerken, mimari tasarım, problem analizi ve kullanıcı deneyimi gibi yüksek seviye beceriler daha da değerli hale geliyor.</p>

<p>AI araçlarını etkin kullanan geliştiriciler, bu dönüşümün kazananları olacak. Önemli olan AI'yı bir rakip değil, güçlü bir iş ortağı olarak görmektir.</p>`,
    tags: ["AI", "Technology", "Future"],
    status: "published",
  },
  {
    title: "Web Performans Optimizasyonu: Core Web Vitals",
    content: `<p>Google'ın <strong>Core Web Vitals</strong> metrikleri, kullanıcı deneyiminin ölçülebilir standartlarını belirledi. LCP, INP ve CLS değerlerini optimize etmek hem kullanıcı memnuniyetini hem de SEO sıralamalarınızı doğrudan etkiler.</p>

<h2>Largest Contentful Paint (LCP)</h2>
<p>LCP, sayfadaki en büyük içerik öğesinin yüklenme süresini ölçer. 2.5 saniyenin altında olmalıdır. Image optimizasyonu, CDN kullanımı, server-side rendering ve kritik kaynakların önceliklendirilmesi LCP'yi iyileştirir.</p>

<h2>Interaction to Next Paint (INP)</h2>
<p>INP, kullanıcı etkileşimlerine verilen yanıt süresini ölçer. 200ms altında olmalıdır. Ana thread'i bloklamaktan kaçınmak, uzun görevleri parçalamak ve Web Worker'lar kullanmak INP'yi optimize eder.</p>

<h2>Cumulative Layout Shift (CLS)</h2>
<p>CLS, sayfadaki beklenmedik layout kaymalarını ölçer. 0.1 altında olmalıdır. Image ve video boyutlarını önceden belirtmek, dinamik içeriklere alan ayırmak ve font yükleme stratejileri CLS'yi minimize eder.</p>

<h2>Ölçme ve İzleme</h2>
<p>Lighthouse, PageSpeed Insights ve Chrome DevTools performans metriklerini ölçmek için temel araçlardır. Real User Monitoring (RUM) ile gerçek kullanıcı verilerini toplayarak optimizasyon kararlarınızı veriyle destekleyin.</p>

<p>Web performansı bir kerelik bir görev değil, sürekli bir iyileştirme sürecidir. Düzenli ölçüm ve optimizasyon ile kullanıcılarınıza en iyi deneyimi sunun.</p>`,
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
