/**
 * InsightFlow Main Logic
 * Integrates Mock Data, OpenAI & Navigation
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
    const tabBtns = document.querySelectorAll('.tab-btn');
    const heroSection = document.getElementById('heroSection');

    let currentTab = 'store'; // 'store' or 'mall'

    // 1. 홈 리셋 기능 (로고 클릭)
    if (homeLogo) {
        homeLogo.addEventListener('click', () => {
            resetUI();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 2. 탭 전환 로직
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            
            // 탭에 따른 입력창 가이드 변경
            if (currentTab === 'mall') {
                storeInput.placeholder = "분석할 쇼핑몰명 또는 상품명을 입력하세요 (예: 쿠팡 OO침구)";
            } else {
                storeInput.placeholder = "분석할 가게명을 입력하세요 (예: 연남동 OO커피)";
            }
            
            resetUI(false); // 분석 결과만 숨김
        });
    });

    if (searchBtn) {
        searchBtn.addEventListener('click', async () => {
            const storeName = storeInput.value.trim();
            if (!storeName) {
                alert('이름을 입력해주세요!');
                return;
            }

            startLoading();

            try {
                // 1. Mock Data 로드
                updateStatus('리뷰 데이터를 수집하고 수익 지표를 계산하는 중...');
                const response = await fetch('mock_reviews.json');
                const mockData = await response.json();
                const reviewTexts = mockData.map(r => `[별점 ${r.rating}] ${r.comment}`).join('\n');

                // 2. OpenAI 심층 분석 (수수료 및 수익 데이터 포함 요청)
                updateStatus(`GPT 5.2 Pro가 ${currentTab === 'mall' ? '쇼핑몰' : '가게'} 데이터를 분석 중...`);
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
        // API 키가 없을 경우 데모 데이터
        if (CONFIG.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const isMall = type === 'mall';
                    resolve({
                        popularMenus: isMall ? ["무선 가습기", "미니 선풍기"] : ["시그니처 라떼", "수제 쿠키"],
                        pros: isMall ? ["디자인이 세련됨", "가성비 좋음"] : ["커피 맛이 좋음", "분위기 아늑함"],
                        cons: isMall ? ["배송 중 파손 주의", "설명서 부족"] : ["주문 처리 속도", "좌석 부족"],
                        improvement: isMall ? "배송 완충재를 보강하고 한글 설명서를 추가하세요." : "피크타임 인력을 보충하고 웨이팅 시스템을 도입하세요.",
                        sentimentScore: 72,
                        urgentIssue: isMall ? "배송 중 파손 리뷰 급증" : "웨이팅 관련 불만 누적",
                        revenueData: isMall ? [
                            { item: "무선 가습기", revenue: 4500000, growth: "+12%" },
                            { item: "미니 선풍기", revenue: 2100000, growth: "+5%" },
                            { item: "보조배터리", revenue: 850000, growth: "-2%" }
                        ] : [
                            { item: "시그니처 라떼", revenue: 1250000, growth: "+15%" },
                            { item: "아메리카노", revenue: 980000, growth: "+2%" },
                            { item: "조각 케이크", revenue: 450000, growth: "+8%" }
                        ]
                    });
                }, 1500);
            });
        }

        const prompt = `
            Analyze these reviews for "${storeName}" (Type: ${type}).
            Return in JSON format:
            {
                "popularMenus": [],
                "pros": [],
                "cons": [],
                "improvement": "",
                "sentimentScore": 0,
                "urgentIssue": "",
                "revenueData": [
                    {"item": "Product/Menu Name", "revenue": 1000000, "growth": "+10%"}
                ]
            }
            *revenueData should be estimated based on popularity in reviews if actual data not provided.
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
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
                <div>
                    <h3 style="font-size: 1.8rem; margin: 0;">${storeName} <span style="font-weight: 400; font-size: 1.2rem; color: var(--text-muted);">(${type === 'mall' ? '쇼핑몰' : '일반 가게'})</span></h3>
                    <p style="margin-top: 0.5rem; color: var(--primary); font-weight: 600;">GPT 5.2 Pro Deep Intelligence Report</p>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 0.9rem; color: var(--text-muted);">종합 만족도</span>
                    <div style="font-size: 2.5rem; font-weight: 800; color: var(--primary);">${data.sentimentScore}%</div>
                </div>
            </div>

            <div class="report-grid">
                <div class="insight-card menu">
                    <strong>🔥 인기 ${type === 'mall' ? '상품' : '메뉴'}</strong>
                    <div class="tag-container">
                        ${data.popularMenus.map(m => `<span class="tag tag-primary">${m}</span>`).join('')}
                    </div>
                </div>
                <div class="insight-card pros">
                    <strong>✅ 주요 장점</strong>
                    <ul style="margin-top: 1rem; padding-left: 1.2rem; font-size: 0.95rem;">
                        ${data.pros.map(p => `<li style="margin-bottom: 0.4rem;">${p}</li>`).join('')}
                    </ul>
                </div>
                <div class="insight-card cons">
                    <strong>⚠️ 보완 필요</strong>
                    <ul style="margin-top: 1rem; padding-left: 1.2rem; font-size: 0.95rem;">
                        ${data.cons.map(c => `<li style="margin-bottom: 0.4rem;">${c}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <!-- 수익 분석 섹션 -->
            <div class="revenue-section">
                <strong>💰 ${type === 'mall' ? '상품별' : '메뉴별'} 예상 수익 분석</strong>
                <table class="revenue-table">
                    <thead>
                        <tr>
                            <th>${type === 'mall' ? '상품명' : '메뉴명'}</th>
                            <th>예상 수익 (월)</th>
                            <th>성장률</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.revenueData.map(d => `
                            <tr>
                                <td>${d.item}</td>
                                <td class="revenue-amount">₩${d.revenue.toLocaleString()}</td>
                                <td style="color: ${d.growth.startsWith('+') ? 'var(--secondary)' : 'red'}">${d.growth}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div style="margin-top: 2rem; background: #fffbeb; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid #fde68a;">
                <strong style="color: #92400e; display: block; margin-bottom: 0.5rem;">🚀 GPT 5.2 Pro의 경영 제안:</strong>
                <p style="color: #92400e; line-height: 1.6;">${data.improvement}</p>
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
                <div class="alert-header">
                    <span class="alert-icon">🚨</span>
                    <strong>긴급 비즈니스 알림</strong>
                </div>
                <p><strong>${data.urgentIssue}</strong> 사례가 감지되었습니다. 즉각적인 조치가 필요합니다!</p>
                <button onclick="this.parentElement.parentElement.remove()" class="btn btn-primary-small">확인</button>
            </div>
        `;
        document.body.appendChild(alertBox);
    }
});
