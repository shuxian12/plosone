document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 已載入,開始讀取 data.json...');
    
    fetch('data.json')
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('資料載入成功:', data);
            renderMenu(data.menu); // 1. 產生選單
            renderContent(data);   // 2. 產生該頁內容
            renderFooterInfo(data); // 3. 產生 footer 資訊
        })
        .catch(err => {
            console.error('❌ 無法讀取資料:', err);
            console.error('錯誤詳情:', err.message);
        });
});

// 渲染導覽列 (支援下拉選單)
function renderMenu(menuData) {
    console.log('開始渲染選單,資料:', menuData);
    const navContainer = document.getElementById('navbar');
    
    if (!navContainer) {
        console.error('❌ 找不到 navbar 元素!');
        return;
    }
    
    const currentPage = window.location.pathname.split("/").pop() || 'index.html';
    console.log('當前頁面:', currentPage);
    
    let html = `<div class="container flex-nav">
                  <h1 class="logo">骨科中心</h1>
                  <ul class="nav-links">`;
    
    menuData.forEach(item => {
        if (item.submenu && item.submenu.length > 0) {
            // 有下拉選單
            const isActive = item.submenu.some(sub => sub.link === currentPage) || item.link === currentPage ? 'active' : '';
            html += `
                <li class="dropdown">
                    <a href="${item.link}" class="${isActive}">
                        ${item.name} <i class="fas fa-chevron-down"></i>
                    </a>
                    <ul class="dropdown-menu">`;
            item.submenu.forEach(sub => {
                const subActive = sub.link === currentPage ? 'active' : '';
                html += `<li><a href="${sub.link}" class="${subActive}">${sub.name}</a></li>`;
            });
            html += `</ul></li>`;
        } else {
            // 一般選單項目
            const isActive = item.link === currentPage ? 'active' : '';
            html += `<li><a href="${item.link}" class="${isActive}">${item.name}</a></li>`;
        }
    });

    html += `</ul></div>`;
    navContainer.innerHTML = html;
    console.log('✅ 選單渲染完成');
}

// 根據頁面 ID 渲染對應內容
function renderContent(data) {
    const pageType = document.body.getAttribute('data-page');
    const container = document.getElementById('content-area');

    if (!container) return;

    // 首頁
    if (pageType === 'homepage') {
        renderHomepage(data.homepage, container);
    }
    // 醫師列表頁
    else if (pageType === 'doctors') {
        renderDoctorsList(data.doctors, container);
    }
    // 個別醫師詳細頁
    else if (pageType === 'doctor-detail') {
        const doctorId = document.body.getAttribute('data-doctor-id');
        const doctor = data.doctors.find(d => d.id == doctorId);
        if (doctor) {
            renderDoctorDetail(doctor, container);
        }
    }
    // 舊的醫師完整列表(保留以防需要)
    else if (pageType === 'doctors-full') {
        data.doctors.forEach(doc => {
            let html = `
                <div class="doctor-card">
                    <div class="doctor-header">
                        <img src="${doc.image}" alt="${doc.name}" onerror="this.src='https://via.placeholder.com/300x300?text=Doctor'">
                        <div class="doctor-info">
                            <h3>${doc.name}</h3>
                            <p class="title">${doc.title}</p>
                            <p class="specialty">${doc.specialty}</p>
                            <p class="intro">${doc.intro}</p>
                        </div>
                    </div>`;
            
            // 學歷
            if (doc.education && doc.education.length > 0) {
                html += `
                    <div class="doctor-section">
                        <h4><i class="fas fa-graduation-cap"></i> 學歷</h4>
                        <ul>`;
                doc.education.forEach(edu => {
                    html += `<li><i class="fas fa-check-circle"></i> ${edu}</li>`;
                });
                html += `</ul></div>`;
            }
            
            // 經歷
            if (doc.experience && doc.experience.length > 0) {
                html += `
                    <div class="doctor-section">
                        <h4><i class="fas fa-briefcase"></i> 經歷</h4>
                        <ul>`;
                doc.experience.forEach(exp => {
                    html += `<li><i class="fas fa-check-circle"></i> ${exp}</li>`;
                });
                html += `</ul></div>`;
            }
            
            // 專業證照
            if (doc.certifications && doc.certifications.length > 0) {
                html += `
                    <div class="doctor-section">
                        <h4><i class="fas fa-certificate"></i> 專業證照</h4>
                        <ul>`;
                doc.certifications.forEach(cert => {
                    html += `<li><i class="fas fa-check-circle"></i> ${cert}</li>`;
                });
                html += `</ul></div>`;
            }
            
            // 專長領域
            if (doc.expertise && doc.expertise.length > 0) {
                html += `
                    <div class="doctor-section">
                        <h4><i class="fas fa-stethoscope"></i> 專長領域</h4>
                        <ul class="expertise-list">`;
                doc.expertise.forEach(exp => {
                    html += `<li><i class="fas fa-check"></i> ${exp}</li>`;
                });
                html += `</ul></div>`;
            }
            
            html += `</div>`;
            container.innerHTML += html;
        });
    } 
    else if (pageType === 'disease') {
        container.innerHTML = `
            <div class="content-box">
                <h3>${data.disease_info.title}</h3>
                ${data.disease_info.content}
            </div>`;
    }
    else if (pageType === 'faq') {
        data.faq.forEach(item => {
            container.innerHTML += `
                <div class="faq-item">
                    <div class="q">Q: ${item.question}</div>
                    <div class="a">A: ${item.answer}</div>
                </div>`;
        });
    }
    else if (pageType === 'interaction') {
        data.interaction.forEach(item => {
            container.innerHTML += `
                <div class="card story">
                    <h3>${item.title}</h3>
                    <small>${item.date}</small>
                    <p>${item.summary}</p>
                </div>`;
        });
    }
    else if (pageType === 'guide') {
        let html = '';
        data.guide.steps.forEach((step, index) => {
            html += `
                <div class="step-item">
                    <div class="step-num">${index + 1}</div>
                    <div class="step-text">${step}</div>
                </div>`;
        });
        if (data.guide.note) {
            html += `<p class="note"><i class="fas fa-exclamation-circle"></i> 注意事項：${data.guide.note}</p>`;
        }
        container.innerHTML = html;
    }
    else if (pageType === 'academic') {
        data.academic.forEach(item => {
            const linkHtml = item.link ? 
                `<a href="${item.link}" target="_blank" class="news-item-link">
                    <div class="news-item">
                        <span class="date">${item.date}</span>
                        <h4>${item.title}</h4>
                        <span class="journal">${item.journal}</span>
                        <i class="fas fa-external-link-alt"></i>
                    </div>
                </a>` :
                `<div class="news-item">
                    <span class="date">${item.date}</span>
                    <h4>${item.title}</h4>
                    <span class="journal">${item.journal}</span>
                </div>`;
            container.innerHTML += linkHtml;
        });
    }
}

// 渲染首頁
function renderHomepage(homepage, container) {
    let html = `
        <section class="hero">
            <div class="container">
                <h1>${homepage.hero.title}</h1>
                <p class="hero-subtitle">${homepage.hero.subtitle}</p>
            </div>
        </section>
        <section class="intro-section">
            <div class="container">
                <h2>${homepage.introduction.title}</h2>
                <p class="intro-content">${homepage.introduction.content}</p>
            </div>
        </section>
        <section class="symptoms-section">
            <div class="container">
                <h2>常見症狀</h2>
                <div class="symptoms-grid">`;
    
    homepage.symptoms.forEach(symptom => {
        html += `
            <div class="symptom-card">
                <i class="fas ${symptom.icon} symptom-icon"></i>
                <h3>${symptom.title}</h3>
                <p>${symptom.description}</p>
            </div>`;
    });
    
    html += `
                </div>
            </div>
        </section>
        <section class="treatments-section">
            <div class="container">
                <h2>${homepage.treatments.title}</h2>
                <div class="treatments-grid">`;
    
    homepage.treatments.options.forEach(treatment => {
        html += `
            <div class="treatment-card">
                <h3>${treatment.name}</h3>
                <p>${treatment.description}</p>
                <span class="treatment-duration"><i class="fas fa-clock"></i> ${treatment.duration}</span>
            </div>`;
    });
    
    html += `
                </div>
            </div>
        </section>`;
    
    container.innerHTML = html;
}

// 渲染醫師列表(概覽)
function renderDoctorsList(doctors, container) {
    let html = '<div class="doctors-grid">';
    
    doctors.forEach(doc => {
        html += `
            <div class="doctor-preview-card">
                <img src="${doc.image}" alt="${doc.name}" onerror="this.src='https://via.placeholder.com/300x300?text=Doctor'">
                <div class="doctor-preview-info">
                    <h3>${doc.name}</h3>
                    <p class="title">${doc.title}</p>
                    <p class="specialty">${doc.specialty}</p>
                    <p class="intro">${doc.intro}</p>
                    <a href="doctor-${doc.id}.html" class="btn-more">查看詳細資料 <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// 渲染個別醫師詳細資料
function renderDoctorDetail(doc, container) {
    let html = `
        <div class="doctor-detail-card">
            <div class="doctor-header">
                <img src="${doc.image}" alt="${doc.name}" onerror="this.src='https://via.placeholder.com/400x400?text=Doctor'">
                <div class="doctor-info">
                    <h1>${doc.name}</h1>
                    <p class="title">${doc.title}</p>
                    <p class="specialty"><i class="fas fa-stethoscope"></i> ${doc.specialty}</p>
                    <p class="intro">${doc.intro}</p>
                </div>
            </div>`;
    
    // 學歷
    if (doc.education && doc.education.length > 0) {
        html += `
            <div class="doctor-section">
                <h3><i class="fas fa-graduation-cap"></i> 學歷</h3>
                <ul>`;
        doc.education.forEach(edu => {
            html += `<li><i class="fas fa-check-circle"></i> ${edu}</li>`;
        });
        html += `</ul></div>`;
    }
    
    // 經歷
    if (doc.experience && doc.experience.length > 0) {
        html += `
            <div class="doctor-section">
                <h3><i class="fas fa-briefcase"></i> 經歷</h3>
                <ul>`;
        doc.experience.forEach(exp => {
            html += `<li><i class="fas fa-check-circle"></i> ${exp}</li>`;
        });
        html += `</ul></div>`;
    }
    
    // 專業證照
    if (doc.certifications && doc.certifications.length > 0) {
        html += `
            <div class="doctor-section">
                <h3><i class="fas fa-certificate"></i> 專業證照</h3>
                <ul>`;
        doc.certifications.forEach(cert => {
            html += `<li><i class="fas fa-check-circle"></i> ${cert}</li>`;
        });
        html += `</ul></div>`;
    }
    
    // 專長領域
    if (doc.expertise && doc.expertise.length > 0) {
        html += `
            <div class="doctor-section">
                <h3><i class="fas fa-stethoscope"></i> 專長領域</h3>
                <ul class="expertise-list">`;
        doc.expertise.forEach(exp => {
            html += `<li><i class="fas fa-check"></i> ${exp}</li>`;
        });
        html += `</ul></div>`;
    }
    
    // 學術著作
    if (doc.publications && doc.publications.length > 0) {
        html += `
            <div class="doctor-section publications-section">
                <h3><i class="fas fa-book"></i> 學術著作</h3>
                <div class="publications-list">`;
        doc.publications.forEach(pub => {
            const typeIcon = pub.type === 'research' ? 'fa-flask' : 
                           pub.type === 'review' ? 'fa-book-open' : 'fa-comments';
            const typeName = pub.type === 'research' ? '研究論文' : 
                           pub.type === 'review' ? '綜述文章' : '研討會發表';
            html += `
                <div class="publication-item">
                    <div class="pub-header">
                        <i class="fas ${typeIcon}"></i>
                        <span class="pub-type">${typeName}</span>
                        <span class="pub-year">${pub.year}</span>
                    </div>
                    <h4>${pub.title}</h4>
                    <p class="pub-journal"><i class="fas fa-journal-whills"></i> ${pub.journal}</p>
                </div>`;
        });
        html += `</div></div>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// 渲染 Footer 資訊
function renderFooterInfo(data) {
    const footer = document.querySelector('footer');
    if (!footer || !data.contact_info) return;
    
    let footerContent = `
        <div class="footer-content">
            <div class="container">
                <div class="footer-grid">
                    <!-- 聯絡資訊 -->
                    <div class="footer-section">
                        <h3>聯絡資訊</h3>
                        <ul class="contact-list">
                            <li><i class="fas fa-envelope"></i> 聯絡信箱:${data.contact_info.email}</li>
                            <li><i class="fas fa-phone"></i> 聯絡電話:${data.contact_info.phone}</li>
                            <li><i class="fab fa-line"></i> <span style="color: #00c300;">LINE</span> ${data.contact_info.line}</li>
                        </ul>
                    </div>`;
    
    // 相關連結
    if (data.related_links && data.related_links.length > 0) {
        footerContent += `
                    <div class="footer-section">
                        <h3>相關連結</h3>
                        <ul class="links-list">`;
        data.related_links.forEach(link => {
            footerContent += `
                            <li>
                                <i class="fas ${link.icon}"></i>
                                <a href="${link.url}" target="_blank">${link.name}</a>
                            </li>`;
        });
        footerContent += `
                        </ul>
                    </div>`;
    }
    
    // 網路掛號
    if (data.schedule && data.schedule.length > 0) {
        footerContent += `
                    <div class="footer-section">
                        <h3>網路掛號</h3>
                        <ul class="schedule-list">`;
        data.schedule.forEach(item => {
            footerContent += `
                            <li>
                                <a href="${item.link}" target="_blank" class="schedule-btn">
                                    ${item.day} <i class="fas fa-external-link-alt"></i>
                                </a>
                            </li>`;
        });
        footerContent += `
                        </ul>
                    </div>`;
    }
    
    footerContent += `
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 骨科壓迫性骨折中心</p>
        </div>`;
    
    footer.innerHTML = footerContent;
}