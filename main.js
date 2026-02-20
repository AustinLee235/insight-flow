/**
 * InsightFlow Main Logic
 * Integrates Mock Data & OpenAI (GPT 5.2 Pro Concept)
 */

const CONFIG = {
    GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY', // MVP 단계에서는 나중에 입력
    OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY', // 사용자가 입력한 실제 키 사용 예정
    MODEL: 'gpt-4o'
};

document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    const storeInput = document.getElementById('storeSearchInput');
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const insightReport = document.getElementById('insightReport');

    if (searchBtn) {
        searchBtn.addEventListener('click', async () => {
            const storeName = storeInput.value.trim();
            if (!storeName) {
                alert('가게명을 입력해주세요!');
                return;
            }

            startLoading();

            try {
                // 1. Mock Data 로드 (가상 고객 리뷰 50개)
                updateStatus('데이터베이스에서 리뷰 50개를 수집하는 중...');
                const response = await fetch('mock_reviews.json');
                const mockData = await response.json();
                const reviewTexts = mockData.map(r => `[별점 ${r.rating}] ${r.comment}`).join('\n');

                // 2. OpenAI 심층 분석 (GPT 5.2 Pro 컨셉)
                updateStatus('GPT 5.2 Pro가 대량의 리뷰 데이터를 심층 분석 중...');
                const analysis = await analyzeWithAI(storeName, reviewTexts);

                // 3. 결과 렌더링
                renderReport(storeName, analysis);
                
                // 4. 긴급 알림 시연 (슬랙 웹훅 스타일)
                showUrgentAlert(analysis);

            } catch (error) {
                console.error(error);
                alert('분석 중 오류가 발생했습니다. OpenAI API 키를 확인해주세요.');
            } finally {
                stopLoading();
            }
        });
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

    async function analyzeWithAI(storeName, reviews) {
        // API 키가 없을 경우 데모용 더미 반환, 있으면 실제 호출
        if (CONFIG.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        popularMenus: ["시그니처 라떼", "초코 디저트", "수제 쿠키"],
                        pros: ["커피 향이 깊고 맛있음", "인테리어가 감각적임", "직원들이 매우 친절함"],
                        cons: ["특정 택배사(OO택배) 배송 지연 심각", "주말 대기 시간 김", "포장 파손 사례 발생"],
                        improvement: "현재 OO택배 관련 배송 지연 불만이 급증하고 있습니다. 즉시 배송 업체를 점검하거나 고객들에게 지연 보상 공지를 띄우는 것을 권장합니다.",
                        sentimentScore: 65,
                        urgentIssue: "OO택배사 배송 지연 불만 급증"
                    });
                }, 2000);
            });
        }

        const prompt = `
            Analyze these 50 reviews for "${storeName}". 
            Extract: 
            1. Popular menus
            2. Pros
            3. Cons
            4. Strategic action plan
            5. Overall sentiment score (0-100)
            6. Identify if there's any 'Urgent Issue' (like a specific delivery company problem or sudden spike in complaints)

            Reviews:
            ${reviews}

            Return in JSON format:
            {
                "popularMenus": [],
                "pros": [],
                "cons": [],
                "improvement": "",
                "sentimentScore": 0,
                "urgentIssue": ""
            }
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

    function renderReport(storeName, data) {
        insightReport.classList.remove('hidden');
        insightReport.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
                <div>
                    <h3 style="font-size: 1.8rem; margin: 0;">${storeName} <span style="font-weight: 400; font-size: 1.2rem; color: var(--text-muted);">종합 리포트</span></h3>
                    <p style="margin-top: 0.5rem; color: var(--primary); font-weight: 600;">GPT 5.2 Pro Analysis Engine</p>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 0.9rem; color: var(--text-muted);">브랜드 건강도</span>
                    <div style="font-size: 2.5rem; font-weight: 800; color: ${data.sentimentScore > 70 ? 'var(--secondary)' : 'var(--accent)'}">${data.sentimentScore}%</div>
                </div>
            </div>

            <div class="report-grid">
                <div class="insight-card menu">
                    <strong>🔥 인기 키워드 & 메뉴</strong>
                    <div class="tag-container">
                        ${data.popularMenus.map(m => `<span class="tag tag-primary">${m}</span>`).join('')}
                    </div>
                </div>
                <div class="insight-card pros">
                    <strong>✅ 핵심 강점</strong>
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

            <div style="margin-top: 2rem; background: #fff; padding: 1.5rem; border-radius: var(--radius-md); border-left: 5px solid var(--primary); box-shadow: var(--shadow);">
                <strong style="color: var(--primary); display: block; margin-bottom: 0.5rem;">🎯 사장님을 위한 AI 전략 제안:</strong>
                <p style="color: var(--text-main); line-height: 1.6;">${data.improvement}</p>
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
                <p>사장님, <strong>${data.urgentIssue}</strong> 사례가 감지되었습니다. 즉각적인 조치가 필요합니다!</p>
                <button onclick="this.parentElement.parentElement.remove()" class="btn btn-primary-small">확인</button>
            </div>
        `;
        document.body.appendChild(alertBox);
    }
});
