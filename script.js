// Grand Service — script.js
// Mobile nav toggle, scroll animations, booking form handler

document.addEventListener('DOMContentLoaded', ()=>{
  // Mobile nav toggle
  const toggle = document.querySelector('.mobile-toggle');
  const nav = document.querySelector('.nav');
  if(toggle && nav){
    toggle.addEventListener('click', ()=>{
      const shown = nav.style.display === 'flex';
      nav.style.display = shown ? 'none' : 'flex';
    });
  }

  // Scroll animations (Intersection Observer)
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('show');
        obs.unobserve(entry.target);
      }
    });
  },{threshold:0.15});
  document.querySelectorAll('.fade-in, .slide-left').forEach(el=>obs.observe(el));

  // Booking form handling
  const form = document.querySelector('#booking-form');
  if(form){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const data = {
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        service: form.service.value,
        datetime: form.datetime.value,
        comment: form.comment.value.trim()
      };
      // Basic validation
      if(!data.name || !data.phone || !data.datetime){
        const lang = localStorage.getItem('gs_lang') || 'ru';
        const msg = (translations[lang] && translations[lang]['alerts.fillRequired']) || 'Please fill in name, phone and date/time.';
        alert(msg);
        return;
      }

      // Try to POST to backend. If fails, fallback to localStorage
      try{
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(data)
        });
        if(res.ok){
          const json = await res.json();
          const lang = localStorage.getItem('gs_lang') || 'ru';
          const msg = (translations[lang] && translations[lang]['alerts.sentServer']) || 'Заявка отправлена! Мы свяжемся с вами для подтверждения. (Отправлено на сервер)';
          alert(msg);
          form.reset();
          // update bookings count display
          const bc = document.querySelector('#bookings-count');
          if(bc){
            const list = await (await fetch('/api/bookings')).json();
            bc.textContent = list.length;
          }
          return;
        }
        throw new Error('Server returned error');
      }catch(err){
        // fallback: save locally
        const bookings = JSON.parse(localStorage.getItem('gs_bookings') || '[]');
        bookings.push(Object.assign({}, data, {submittedAt: new Date().toISOString()}));
        localStorage.setItem('gs_bookings', JSON.stringify(bookings));
        const lang2 = localStorage.getItem('gs_lang') || 'ru';
        const msg2 = (translations[lang2] && translations[lang2]['alerts.savedLocal']) || 'Сервер недоступен — заявка сохранена локально. Мы покажем её в списке при подключении.';
        alert(msg2);
        form.reset();
      }
    });
  }

  // Simple demo: show number of saved bookings if any
  const bookingsCount = document.querySelector('#bookings-count');
  if(bookingsCount){
    const count = JSON.parse(localStorage.getItem('gs_bookings') || '[]').length;
    bookingsCount.textContent = count;
  }

  // Logo + favicon fallback loader
  (function setLogoAndFavicon(){
    const candidates = ['assets/Снимок экрана 2025-11-19 в 15.01.35.png','assets/gs_screenshot.png','assets/gs.jpeg','assets/share.jpg'];
    function tryNext(imgEl, linkEl, idx){
      if(idx >= candidates.length) return;
      const url = candidates[idx];
      const tester = new Image();
      tester.onload = ()=>{
        if(imgEl) imgEl.src = url;
        if(linkEl) linkEl.href = url;
      };
      tester.onerror = ()=> tryNext(imgEl, linkEl, idx+1);
      tester.src = url;
    }
    const logoImg = document.querySelector('.logo-img');
    // find favicon link (rel contains "icon")
    const linkEl = Array.from(document.getElementsByTagName('link')).find(l=> (l.rel && l.rel.toLowerCase().includes('icon')));
    tryNext(logoImg, linkEl, 0);
  })();

  // Simple i18n support (RU / RO / EN)
  const translations = {
    ru: {
      'nav.home':'Главная', 'nav.services':'Услуги', 'nav.booking':'Бронирование', 'nav.reviews':'Отзывы', 'nav.contacts':'Контакты', 'nav.cta':'Записаться',
      'brand.subtitle':'Бронирование',
      'hero.title':'Grand Service', 'hero.lead':'Профессиональный автосервис: диагностика, ремонт двигателя, замена масла, развал схождения и многое другое.', 'hero.book':'Записаться', 'hero.reviewsBtn':'Отзывы',
      'contact.line':'Тел: <b>076717322</b> • Cahul City, Nicolaie Balcescu 32',
      'services.title':'Наши услуги',
        'hero.tagline':'Качественный сервис для вашего автомобиля',
        'footer.copy':'© Grand Service — Все права защищены',
        'bookings.savedLabel':'Сохранено заявок: {count}',
        'about.title':'О нас',
        'about.team.title':'Опытная команда','about.team.text':'Наши мастера имеют многолетний опыт в ремонте европейских и азиатских авто.',
        'about.equipment.title':'Современное оборудование','about.equipment.text':'Диагностика и ремонт на профессиональном уровне с использованием современного оборудования.',
        'about.warranty.title':'Гарантия качества','about.warranty.text':'Мы предоставляем гарантию на выполненные работы и используемые детали.',
      'service.diagnostics.title':'Диагностика','service.diagnostics.desc':'Компьютерная диагностика двигателя и электронных систем.',
      'service.engine.title':'Ремонт двигателя','service.engine.desc':'Ремонт и восстановление компонентов двигателя.',
      'service.oil.title':'Замена масла','service.oil.desc':'Быстрая замена масла и фильтров с гарантией качества.',
      'service.alignment.title':'Развал схождения','service.alignment.desc':'Профессиональная настройка углов колес для безопасного вождения.',
      'service.our.title':'Наш сервис','service.our.desc':'Фотография сервиса Grand Service — знакомьтесь с нашим центром обслуживания.',
      'shop.title':'Купить запчасть для вашего авто',
      'reviews.title':'Отзывы наших клиентов','reviews.readAll':'Читать все отзывы',
      'review.1.name':'Алексей','review.1.text':'Отличный сервис, поменяли масло и сделали диагностику за один визит.',
      'review.2.name':'Марина','review.2.text':'Вежливый персонал и разумные цены. Рекомендую.',
      'review.3.name':'Виктор','review.3.text':'Поменяли тормоза быстро, машина как новая.',
      'review.4.name':'Ирина','review.4.text':'Очень довольна работой сервиса — сделали всё аккуратно и быстро.',
      'review.5.name':'Александр','review.5.text':'Профессиональная диагностика помогла найти проблему с электрикой.',
      'review.6.name':'Светлана','review.6.text':'Хорошие цены и вежливые мастера. Рекомендую.',
      'review.7.name':'Павел','review.7.text':'Поменяли тормоза и дали гарантию. Спасибо!',
      'review.8.name':'Наталья','review.8.text':'Удобно записаться, все прошло по плану.',
      'contacts.title':'Контакты','contacts.address.title':'Адрес','contacts.address.text':'Cahul City, str. Nicolaie Balcescu 32','contacts.phone.title':'Телефон','contacts.phone.text':'076717322','contacts.hours.title':'Часы работы','contacts.hours.text':'Пн-Пт: 08:00 — 18:00, Сб: 08:00 — 12:00',
      // booking
      'booking.title':'Запись на сервис','booking.name.placeholder':'Ваше имя','booking.phone.placeholder':'Телефон','booking.service.placeholder':'Выберите тип услуги','booking.datetime.placeholder':'Дата и время','booking.car.placeholder':'Марка/Модель (опционально)','booking.comment.placeholder':'Комментарий','booking.submit':'Отправить заявку',
      'booking.service.option.diagnostics':'Диагностика','booking.service.option.engine':'Ремонт двигателя','booking.service.option.oil':'Замена масла','booking.service.option.alignment':'Развал схождения',
      'alerts.fillRequired':'Пожалуйста, заполните имя, телефон и дату/время.','alerts.sentServer':'Заявка отправлена! Мы свяжемся с вами для подтверждения. (Отправлено на сервер)','alerts.savedLocal':'Сервер недоступен — заявка сохранена локально. Мы покажем её в списке при подключении.'
    },
    ro: {
      'nav.home':'Acasă','nav.services':'Servicii','nav.booking':'Programare','nav.reviews':'Recenzii','nav.contacts':'Contact','nav.cta':'Programează-te',
      'brand.subtitle':'Programare',
      'hero.title':'Grand Service','hero.lead':'Service auto profesional: diagnosticare, reparații motor, montaj anvelope, schimb ulei și altele.','hero.book':'Programează-te','hero.reviewsBtn':'Recenzii',
      'contact.line':'Tel: <b>076717322</b> • Cahul City, Nicolaie Balcescu 32',
      'services.title':'Serviciile noastre',
        'hero.tagline':'Serviciu de calitate pentru autovehiculul dvs.',
        'footer.copy':'© Grand Service — Toate drepturile rezervate',
        'bookings.savedLabel':'Cereri salvate: {count}',
        'about.title':'Despre noi',
        'about.team.title':'Echipă experimentată','about.team.text':'Mecanicii noștri au ani de experiență în repararea mașinilor europene și asiatice.',
        'about.equipment.title':'Echipament modern','about.equipment.text':'Diagnosticare și reparații la nivel profesional folosind echipamente moderne.',
        'about.warranty.title':'Garanție de calitate','about.warranty.text':'Oferim garanție pentru lucrările efectuate și piesele folosite.',
      'service.diagnostics.title':'Diagnostic','service.diagnostics.desc':'Diagnosticare computerizată a motorului și sistemelor electronice.',
      'service.tires.title':'Montaj anvelope','service.tires.desc':'Schimb sezonier de anvelope, echilibrare, reparare pană.',
      'service.engine.title':'Reparații motor','service.engine.desc':'Reparații și refacere componente motor.',
      'service.oil.title':'Schimb ulei','service.oil.desc':'Schimb ulei și filtre cu garanție de calitate.',
      'service.our.title':'Service-ul nostru','service.our.desc':'Fotografia centrului Grand Service — cunoașteți centrul nostru de service.',
      'shop.title':'Cumpără piese pentru mașina ta',
      'reviews.title':'Recenziile clienților','reviews.readAll':'Vezi toate recenziile',
      'review.1.name':'Alexei','review.1.text':'Serviciu excelent, au schimbat uleiul și au făcut diagnostic în aceeași vizită.',
      'review.2.name':'Marina','review.2.text':'Personal amabil și prețuri corecte. Recomand.',
      'review.3.name':'Victor','review.3.text':'Au schimbat frânele rapid, mașina ca nouă.',
      'review.4.name':'Irina','review.4.text':'Foarte mulțumită de serviciu — totul făcut rapid și corect.',
      'review.5.name':'Alexandr','review.5.text':'Diagnostic profesionist, problema electrică găsită.',
      'review.6.name':'Svetlana','review.6.text':'Prețuri bune și mecanici prietenoși. Recomand.',
      'review.7.name':'Pavel','review.7.text':'Au schimbat frânele și au oferit garanție. Mulțumesc!',
      'review.8.name':'Natalia','review.8.text':'Ușor de programat, totul a decurs conform planului.',
      'contacts.title':'Contact','contacts.address.title':'Adresă','contacts.address.text':'Cahul City, str. Nicolaie Balcescu 32','contacts.phone.title':'Telefon','contacts.phone.text':'076717322','contacts.hours.title':'Program','contacts.hours.text':'Lun-Vin: 9:00 — 18:00, Sâmb: 9:00 — 14:00',
      'booking.title':'Programare','booking.name.placeholder':'Numele dvs.','booking.phone.placeholder':'Telefon','booking.service.placeholder':'Selectați tipul serviciului','booking.datetime.placeholder':'Data și ora','booking.car.placeholder':'Marca/Model (opțional)','booking.comment.placeholder':'Comentariu','booking.submit':'Trimite cererea'
        , 'booking.service.option.diagnostics':'Diagnostic','booking.service.option.tires':'Montaj anvelope','booking.service.option.engine':'Reparații motor','booking.service.option.oil':'Schimb ulei','booking.service.option.balance':'Echilibrare'
      , 'alerts.fillRequired':'Vă rugăm completați numele, telefonul și data/ora.','alerts.sentServer':'Cererea a fost trimisă! Vă vom contacta pentru confirmare. (Trimis la server)','alerts.savedLocal':'Serverul indisponibil — cererea a fost salvată local. O vom afișa în listă la conectare.'
    },
    en: {
      'nav.home':'Home','nav.services':'Services','nav.booking':'Booking','nav.reviews':'Reviews','nav.contacts':'Contacts','nav.cta':'Book Now',
      'brand.subtitle':'Booking',
      'hero.title':'Grand Service','hero.lead':'Professional auto service: diagnostics, engine repair, tire service, oil change and more.','hero.book':'Book Now','hero.reviewsBtn':'Reviews',
      'contact.line':'Tel: <b>076717322</b> • Cahul City, Nicolaie Balcescu 32',
      'services.title':'Our Services',
        'hero.tagline':'Quality service for your vehicle',
        'footer.copy':'© Grand Service — All rights reserved',
        'bookings.savedLabel':'Saved bookings: {count}',
        'about.title':'About Us',
        'about.team.title':'Experienced Team','about.team.text':'Our technicians have many years of experience repairing European and Asian cars.',
        'about.equipment.title':'Modern Equipment','about.equipment.text':'Diagnostics and repairs at a professional level using modern equipment.',
        'about.warranty.title':'Quality Guarantee','about.warranty.text':'We provide a guarantee for work performed and parts used.',
      'service.diagnostics.title':'Diagnostics','service.diagnostics.desc':'Computer diagnostics of engine and electronic systems.',
      'service.tires.title':'Tire Service','service.tires.desc':'Seasonal tire changes, balancing, puncture repair.',
      'service.engine.title':'Engine Repair','service.engine.desc':'Repair and restoration of engine components.',
      'service.oil.title':'Oil Change','service.oil.desc':'Quick oil and filter change with quality guarantee.',
      'service.our.title':'Our Service','service.our.desc':'Photo of Grand Service — get to know our service center.',
      'shop.title':'Buy parts for your car',
      'reviews.title':'Customer Reviews','reviews.readAll':'Read all reviews',
      'review.1.name':'Alex','review.1.text':'Great service, changed oil and did diagnostics in one visit.',
      'review.2.name':'Maria','review.2.text':'Friendly staff and fair prices. Recommend.',
      'review.3.name':'Victor','review.3.text':'Changed brakes quickly, car feels like new.',
      'review.4.name':'Irina','review.4.text':'Very happy with the service — everything done neatly and fast.',
      'review.5.name':'Alexander','review.5.text':'Professional diagnostics helped find the electrical issue.',
      'review.6.name':'Svetlana','review.6.text':'Good prices and polite mechanics. Recommend.',
      'review.7.name':'Paul','review.7.text':'Replaced brakes and provided a warranty. Thanks!',
      'review.8.name':'Natalie','review.8.text':'Easy to book, everything went according to plan.',
      'contacts.title':'Contacts','contacts.address.title':'Address','contacts.address.text':'Cahul City, str. Nicolaie Balcescu 32','contacts.phone.title':'Phone','contacts.phone.text':'076717322','contacts.hours.title':'Hours','contacts.hours.text':'Mon-Fri: 9:00 — 18:00, Sat: 9:00 — 14:00',
      'booking.title':'Booking','booking.name.placeholder':'Your name','booking.phone.placeholder':'Phone','booking.service.placeholder':'Choose service type','booking.datetime.placeholder':'Date & time','booking.car.placeholder':'Make/Model (optional)','booking.comment.placeholder':'Comment','booking.submit':'Send request'
        , 'booking.service.option.diagnostics':'Diagnostics','booking.service.option.tires':'Tire Service','booking.service.option.engine':'Engine Repair','booking.service.option.oil':'Oil Change','booking.service.option.balance':'Balancing'
      , 'alerts.fillRequired':'Please fill in name, phone and date/time.','alerts.sentServer':'Request sent! We will contact you to confirm. (Sent to server)','alerts.savedLocal':'Server unavailable — request saved locally. We will show it in the list when connected.'
    }
  };

  function applyTranslations(lang){
    const map = translations[lang] || translations['ru'];
    // text content
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      if(map[key]){
        let value = map[key];
        if(key === 'bookings.savedLabel'){
          const count = JSON.parse(localStorage.getItem('gs_bookings') || '[]').length;
          value = value.replace('{count}', `<span id="bookings-count">${count}</span>`);
        }
        el.innerHTML = value;
      }
    });
    // placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
      const key = el.getAttribute('data-i18n-placeholder');
      if(map[key]) el.placeholder = map[key];
    });
    // alt attributes (images)
    document.querySelectorAll('[data-i18n-alt]').forEach(el=>{
      const key = el.getAttribute('data-i18n-alt');
      if(map[key]) el.alt = map[key];
    });
    // select placeholder option
    document.querySelectorAll('[data-i18n-select]').forEach(el=>{
      const placeholderOption = el.querySelector('option[value=""]');
      if(placeholderOption){
        const placeholderKey = placeholderOption.getAttribute('data-i18n');
        if(placeholderKey && map[placeholderKey]) placeholderOption.textContent = map[placeholderKey];
      }
      // translate any option that has a data-i18n key
      Array.from(el.querySelectorAll('option[data-i18n]')).forEach(opt=>{
        const k = opt.getAttribute('data-i18n');
        if(k && map[k]) opt.textContent = map[k];
      });
    });
    // also translate standalone options outside selects
    document.querySelectorAll('option[data-i18n]').forEach(opt=>{
      const k = opt.getAttribute('data-i18n');
      if(k && map[k]) opt.textContent = map[k];
    });
    // store
    localStorage.setItem('gs_lang', lang);
  }

  // initialize language from localStorage or browser
  const savedLang = localStorage.getItem('gs_lang') || (navigator.language && navigator.language.startsWith('ro')? 'ro' : (navigator.language && navigator.language.startsWith('en')? 'en' : 'ru'));
  applyTranslations(savedLang);

  // language buttons
  document.querySelectorAll('.lang-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const l = btn.getAttribute('data-lang');
      applyTranslations(l);
    });
  });
});
