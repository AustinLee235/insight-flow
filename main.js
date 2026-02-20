/**
 * InsightFlow Main Logic
 * Integrates Mock Data, OpenAI & Deep Business Insights (Consultant Persona)
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

                // 2. OpenAI 심층 분석 (수석 경영 컨설턴트 페르소나 적용)
                updateStatus(`GPT 수석 컨설턴트가 ${currentTab === 'mall' ? '이커머스' : '매장'} 경영 진단을 수행 중...`);
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
                        monthlyTrends: [45, 52, 48, 65, 78, 85],
                        
                        // New Structured Insight Fields
                        issueDefinition: isMall ? "최근 2주간 '배송 파손' 관련 불만이 전체 리뷰의 18%를 차지하며 급증하고 있습니다." : "최근 주말 '대기 시간' 관련 불만이 전체 리뷰의 25%를 차지하고 있습니다.",
                        rootCause: isMall ? "단순한 배송 부주의가 아니라, '기본 박스 내 완충재가 얇아 충격에 취약한 점'이 근본 원인으로 파악됩니다." : "단순히 사람이 많은 게 문제가 아니라, '대기 순서를 알 수 없어 밖에서 마냥 서 있어야 하는 불확실성'이 가장 큰 스트레스 요인입니다.",
                        actionPlan: {
                            immediate: isMall ? "현재 재고 박스에 에어캡을 두 겹 더 두르는 임시 조치를 즉시 시행해보세요." : "매장 입구에 '현재 예상 대기 시간 20분'이라는 안내 팻말만 세워두셔도 체감 불만을 크게 줄일 수 있습니다.",
                            midTerm: isMall ? "내구성이 강화된 친환경 하드 박스로 패키징 변경을 검토해보세요. (단가 150원 상승 예상)" : "캐치테이블이나 나우웨이팅 같은 알림 기반 웨이팅 태블릿 도입을 권장합니다.",
                            upsell: isMall ? "패키징 변경 공지와 함께 '선물하기 좋은 에디션'으로 마케팅하여 객단가를 높여보세요." : "기다리시는 고객분들께 '미니 쿠키'를 시식용으로 제공해보세요. 부정 경험이 긍정으로 바뀔 것입니다."
                        },
                        expectedImpact: isMall ? "파손 반품률 5% 감소 및 재구매율 10% 상승으로 월 약 50만 원의 손실 비용 절감이 기대됩니다." : "대기 이탈 고객(주말 평균 10팀)을 방어하여 월평균 약 30만 원 이상의 매출 보전 효과가 기대됩니다.",
                        benchmarking: {
                            metric: isMall ? "배송 만족도" : "직원 친절도",
                            myScore: 78,
                            competitorScore: 85,
                            gap: -7
                        },
                        detailPageAdvice: isMall ? "상세페이지 상단에 '안전한 배송을 위한 3중 안심 포장' 배너를 추가하여 구매 전환율을 높여보세요." : "네이버 지도 소식란에 '편안한 대기 공간 마련' 소식을 올려 방문 유입을 늘려보세요."
                    });
                }, 2000);
            });
        }

        const prompt = `
            You are a 'Chief Business Consultant' for small business owners. 
            Analyze 50 reviews for "${storeName}" (Type: ${type}).
            Tone: Professional yet friendly, avoiding jargon. Focus on data-backed root causes and actionable items.

            Output JSON structure:
            {
                "popularMenus": [], "pros": [], "cons": [], "sentimentScore": 0, "urgentIssue": "",
                "revenueData": [{"item": "", "revenue": 0, "growth": ""}],
                "representativeReviews": [{"rating": 5, "comment": ""}],
                "peakHours": "",
                "monthlyTrends": [number, number, number, number, number, number],
                "issueDefinition": "Data-backed issue description (e.g., 'Complaints about X increased by Y%')",
                "rootCause": "Deep analysis of the real cause",
                "actionPlan": {
                    "immediate": "Cost-free immediate action",
                    "midTerm": "System/investment based action",
                    "upsell": "Opportunity to increase sales"
                },
                "expectedImpact": "Financial/Numeric impact projection",
                "benchmarking": {
                    "metric": "Key metric (e.g., Service, Delivery)",
                    "myScore": 0-100,
                    "competitorScore": 0-100,
                    "gap": number
                },
                "detailPageAdvice": "Specific advice for product detail page or store description"
            }
            
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
                messages: [{ role: 'system', content: "You are a helpful and analytical business consultant." }, { role: 'user', content: prompt }],
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
                    <h3 style="font-size: 1.8rem; margin: 0;">${storeName} <span style="font-weight: 400; font-size: 1.2rem; color: var(--text-muted);">경영 진단 리포트</span></h3>
                    <div style="margin-top: 0.8rem;" class="peak-hours-badge">
                        <span>⏰ 골든 타임:</span> ${data.peakHours}
                    </div>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 0.9rem; color: var(--text-muted);">종합 브랜드 건강도</span>
                    <div style="font-size: 2.5rem; font-weight: 800; color: var(--primary);">${data.sentimentScore}점</div>
                </div>
            </div>

            <!-- 1. 핵심 인사이트 (4-Step Structure) -->
            <div class="consulting-section">
                <div class="consulting-card issue">
                    <div class="card-title">🚨 문제 감지</div>
                    <p>${data.issueDefinition}</p>
                </div>
                <div class="consulting-card cause">
                    <div class="card-title">🔍 심층 원인 분석</div>
                    <p>${data.rootCause}</p>
                </div>
                
                <div class="action-plan-container">
                    <div class="card-title" style="margin-bottom: 1rem;">🛠️ 단계별 솔루션</div>
                    <div class="action-step immediate">
                        <span class="step-badge">즉시 실행</span>
                        <p>${data.actionPlan.immediate}</p>
                    </div>
                    <div class="action-step midterm">
                        <span class="step-badge">시스템 도입</span>
                        <p>${data.actionPlan.midTerm}</p>
                    </div>
                    <div class="action-step upsell">
                        <span class="step-badge">매출 기회</span>
                        <p>${data.actionPlan.upsell}</p>
                    </div>
                </div>

                <div class="consulting-card impact">
                    <div class="card-title">💰 예상 재무 효과</div>
                    <p class="impact-text">${data.expectedImpact}</p>
                </div>
            </div>

            <!-- 2. 벤치마킹 및 상세 조언 -->
            <div class="report-grid" style="margin-top: 2rem;">
                <div class="insight-card">
                    <strong>📊 경쟁사 벤치마킹 (${data.benchmarking.metric})</strong>
                    <div class="benchmark-chart">
                        <div class="benchmark-bar">
                            <span class="label">나의 점수</span>
                            <div class="bar-fill my" style="width: ${data.benchmarking.myScore}%"></div>
                            <span class="score">${data.benchmarking.myScore}</span>
                        </div>
                        <div class="benchmark-bar">
                            <span class="label">경쟁사 평균</span>
                            <div class="bar-fill competitor" style="width: ${data.benchmarking.competitorScore}%"></div>
                            <span class="score">${data.benchmarking.competitorScore}</span>
                        </div>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem; text-align: center;">
                        경쟁사 대비 <span style="color: ${data.benchmarking.gap >= 0 ? 'var(--secondary)' : 'var(--accent)'}; font-weight: bold;">${Math.abs(data.benchmarking.gap)}점 ${data.benchmarking.gap >= 0 ? '높습니다' : '낮습니다'}</span>.
                    </p>
                </div>
                <div class="insight-card" style="border-left: 4px solid #8b5cf6;">
                    <strong>💡 ${type === 'mall' ? '상세페이지' : '매장 관리'} 꿀팁</strong>
                    <p style="margin-top: 1rem; font-size: 0.95rem; line-height: 1.5;">${data.detailPageAdvice}</p>
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
