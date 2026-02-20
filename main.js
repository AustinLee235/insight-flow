/**
 * InsightFlow Main Logic
 * Integrates Mock Data, OpenAI & Deep Business Insights
 */

const CONFIG = {
    GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY',
    OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY',
    MODEL: 'gpt-4o'
};

document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    const storeInput = document.getElementById('storeSearchInput');
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const insightReport = document.getElementById('insightReport');
    const homeLogo = document.getElementById('homeLogo');
    const navAnalyzer = document.getElementById('navAnalyzer');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const heroSection = document.getElementById('heroSection');

    let currentTab = 'store'; // 'store' or 'mall'

    // 1. 홈 및 AI 분석기 리셋 기능
    const handleReset = (e) => {
        if (e) e.preventDefault();
        resetUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (homeLogo) homeLogo.addEventListener('click', handleReset);
    if (navAnalyzer) navAnalyzer.addEventListener('click', handleReset);

    // 2. 엔터키 지원
    if (storeInput) {
        storeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }

    // 3. 탭 전환 로직
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            
            if (currentTab === 'mall') {
                storeInput.placeholder = "분석할 쇼핑몰명 또는 상품명을 입력하세요";
            } else {
                storeInput.placeholder = "분석할 가게명을 입력하세요";
            }
            
            resetUI(false);
        });
    });

    if (searchBtn) {
        searchBtn.addEventListener('click', async () => {
            const storeName = storeInput.value.trim();
            if (!storeName) {
                alert('분석할 이름을 입력해주세요!');
                return;
            }

            startLoading();

            try {
                // 1. Mock Data 로드
                updateStatus('리뷰 50개를 정밀 분석하여 비즈니스 패턴을 추출 중...');
                const response = await fetch('mock_reviews.json');
                const mockData = await response.json();
                const reviewTexts = mockData.map(r => `[별점 ${r.rating}] ${r.comment}`).join('\n');

                // 2. OpenAI 심층 분석 (대표 리뷰, 피크 시간, 매출 트렌드 포함)
                updateStatus(`GPT 5.2 Pro가 ${currentTab === 'mall' ? '이커머스' : '매장'} 최적화 전략을 수립 중...`);
                const analysis = await analyzeWithAI(storeName, reviewTexts, currentTab);

                // 3. 결과 렌더링
                renderReport(storeName, analysis, currentTab);
                
                // 4. 긴급 알림
                showUrgentAlert(analysis);

            } catch (error) {
                console.error(error);
                alert('분석 중 오류가 발생했습니다. API 키 설정을 확인해주세요.');
            } finally {
                stopLoading();
            }
        });
    }

    function resetUI(full = true) {
        insightReport.classList.add('hidden');
        if (full) {
            storeInput.value = '';
            heroSection.style.display = 'flex';
        }
        const existingAlerts = document.querySelectorAll('.urgent-alert-popup');
        existingAlerts.forEach(a => a.remove());
    }

    function startLoading() {
        statusIndicator.classList.remove('hidden');
        insightReport.classList.add('hidden');
        searchBtn.disabled = true;
    }

    function stopLoading() {
        statusIndicator.classList.add('hidden');
        searchBtn.disabled = false;
    }

    function updateStatus(text) {
        statusText.textContent = text;
    }

    async function analyzeWithAI(storeName, reviews, type) {
        if (CONFIG.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const isMall = type === 'mall';
                    resolve({
                        popularMenus: isMall ? ["무선 가습기", "미니 선풍기", "보조배터리"] : ["시그니처 라떼", "수제 쿠키", "아인슈페너"],
                        pros: isMall ? ["고급스러운 패키징", "빠른 초기 불량 대응"] : ["전문적인 바리스타 서비스", "조용한 작업 환경"],
                        cons: isMall ? ["배송 중 파손 사례", "앱 연동 불편"] : ["주말 좌석 회전율 저하", "화장실 위치 찾기 어려움"],
                        improvement: isMall ? "배송 완충재를 친환경 소재로 교체하고, 모바일 앱 가이드를 상품 페이지 상단에 배치하세요." : "디지털 대기 시스템 도입으로 고객 이탈을 방지하고, 화장실 안내 표지판을 직관적인 디자인으로 개선하세요.",
                        sentimentScore: 78,
                        urgentIssue: isMall ? "배송 중 파손 리뷰 15% 증가" : "주말 웨이팅 불만 누적",
                        revenueData: isMall ? [
                            { item: "무선 가습기", revenue: 4500000, growth: "+12%" },
                            { item: "미니 선풍기", revenue: 2100000, growth: "+5%" },
                            { item: "보조배터리", revenue: 850000, growth: "-2%" }
                        ] : [
                            { item: "시그니처 라떼", revenue: 1250000, growth: "+15%" },
                            { item: "아메리카노", revenue: 980000, growth: "+2%" },
                            { item: "조각 케이크", revenue: 450000, growth: "+8%" }
                        ],
                        representativeReviews: [
                            { rating: 5, comment: "커피 맛도 최고지만 사장님의 마인드가 느껴지는 공간이에요." },
                            { rating: 2, comment: "제품은 좋지만 배송 상태가 너무 실망스럽습니다. 개선이 시급해요." }
                        ],
                        peakHours: isMall ? "화요일 오후 2시 - 4시 (주문 급증)" : "오후 1시 - 3시 (피크 타임)",
                        monthlyTrends: [45, 52, 48, 65, 78, 85] // 최근 6개월 매출 지수
                    });
                }, 2000);
            });
        }

        const prompt = `
            Analyze 50 reviews for "${storeName}" (Type: ${type}).
            Return JSON:
            {
                "popularMenus": [], "pros": [], "cons": [], "improvement": "", "sentimentScore": 0, "urgentIssue": "",
                "revenueData": [{"item": "", "revenue": 0, "growth": ""}],
                "representativeReviews": [{"rating": 5, "comment": ""}],
                "peakHours": "",
                "monthlyTrends": [number, number, number, number, number, number] 
            }
            *monthlyTrends should be 6 relative numbers representing last 6 months revenue strength.
            *Return only JSON.

            Reviews:
            ${reviews}
        `;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: CONFIG.MODEL,
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    }

    function renderReport(storeName, data, type) {
        insightReport.classList.remove('hidden');
        insightReport.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;">
                <div>
                    <h3 style="font-size: 1.8rem; margin: 0;">${storeName} <span style="font-weight: 400; font-size: 1.2rem; color: var(--text-muted);">심층 리포트</span></h3>
                    <div style="margin-top: 0.8rem;" class="peak-hours-badge">
                        <span>⏰ 추천 집중 시간:</span> ${data.peakHours}
                    </div>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 0.9rem; color: var(--text-muted);">종합 브랜드 지수</span>
                    <div style="font-size: 2.5rem; font-weight: 800; color: var(--primary);">${data.sentimentScore}%</div>
                </div>
            </div>

            <div class="report-grid">
                <div class="insight-card menu">
                    <strong>🔥 트렌드 키워드</strong>
                    <div class="tag-container">
                        ${data.popularMenus.map(m => `<span class="tag tag-primary">${m}</span>`).join('')}
                    </div>
                    
                    <div style="margin-top: 2rem;">
                        <strong>📊 최근 6개월 매출 추이</strong>
                        <div class="chart-container">
                            ${data.monthlyTrends.map((val, i) => `
                                <div class="chart-bar-wrapper">
                                    <div class="chart-bar ${i === 5 ? 'active' : ''}" style="height: ${val}%"></div>
                                    <span class="chart-label">${i+1}월</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="insight-card pros">
                    <strong>✅ 주요 강점</strong>
                    <ul style="margin-top: 1rem; padding-left: 1.2rem; font-size: 0.95rem;">
                        ${data.pros.map(p => `<li style="margin-bottom: 0.4rem;">${p}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="insight-card cons">
                    <strong>⚠️ 리스크 요소</strong>
                    <ul style="margin-top: 1rem; padding-left: 1.2rem; font-size: 0.95rem;">
                        ${data.cons.map(c => `<li style="margin-bottom: 0.4rem;">${c}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <!-- 수익 분석 -->
            <div class="revenue-section">
                <strong>💰 ${type === 'mall' ? '상품별' : '메뉴별'} 매출 기여도</strong>
                <table class="revenue-table">
                    <thead>
                        <tr><th>항목</th><th>예상 매출</th><th>성장률</th></tr>
                    </thead>
                    <tbody>
                        ${data.revenueData.map(d => `
                            <tr><td>${d.item}</td><td class="revenue-amount">₩${d.revenue.toLocaleString()}</td><td style="color: ${d.growth.startsWith('+') ? 'var(--secondary)' : 'red'}">${d.growth}</td></tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- 대표 리뷰 -->
            <div class="representative-reviews">
                <strong>💬 대표 리뷰 핵심 요약</strong>
                <div style="margin-top: 1rem;">
                    ${data.representativeReviews.map(r => `
                        <div class="review-bubble">
                            <span class="rating">★ ${r.rating}</span> "${r.comment}"
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- 최종 제안 -->
            <div style="margin-top: 2rem; background: #fff; padding: 1.5rem; border-radius: var(--radius-md); border-left: 5px solid var(--primary); box-shadow: var(--shadow);">
                <strong style="color: var(--primary); display: block; margin-bottom: 0.5rem;">🎯 GPT 5.2 Pro의 경영 인사이트:</strong>
                <p style="color: var(--text-main); line-height: 1.6; font-size: 1rem;">${data.improvement}</p>
            </div>
        `;
        insightReport.scrollIntoView({ behavior: 'smooth' });
    }

    function showUrgentAlert(data) {
        if (!data.urgentIssue) return;
        const alertBox = document.createElement('div');
        alertBox.className = 'urgent-alert-popup';
        alertBox.innerHTML = `
            <div class="alert-content">
                <div class="alert-header"><span class="alert-icon">🚨</span><strong>긴급 알림</strong></div>
                <p><strong>${data.urgentIssue}</strong> 사례가 발견되었습니다. 즉시 확인이 필요합니다.</p>
                <button onclick="this.parentElement.parentElement.remove()" class="btn btn-primary-small">확인</button>
            </div>
        `;
        document.body.appendChild(alertBox);
    }
});
