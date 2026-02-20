/**
 * InsightFlow Main Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const reviewInput = document.getElementById('reviewInput');
    const analysisResult = document.getElementById('analysisResult');

    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', () => {
            const text = reviewInput.value.trim();
            
            if (!text) {
                alert('리뷰를 입력해주세요!');
                return;
            }

            // 시뮬레이션 로딩 효과
            analyzeBtn.disabled = true;
            analyzeBtn.textContent = 'AI 분석 중...';
            analysisResult.innerHTML = `
                <div class="text-center">
                    <p>데이터 패턴 분석 중...</p>
                </div>
            `;

            setTimeout(() => {
                const insight = generateInsight(text);
                renderResult(insight);
                analyzeBtn.disabled = false;
                analyzeBtn.textContent = 'AI 분석하기';
            }, 1500);
        });
    }

    /**
     * 입력된 텍스트에 따라 가상의 AI 인사이트 생성
     */
    function generateInsight(text) {
        let category = "일반 분석";
        let sentiment = "중립";
        let actionItem = "리뷰 데이터를 더 수집하여 경향성을 파악하세요.";
        let score = 50;

        if (text.includes('배송') || text.includes('느려요') || text.includes('택배')) {
            category = "물류/배송";
            sentiment = "부정";
            score = 25;
            actionItem = "수도권 지역 특정 택배사 배송 지연율이 높습니다. 대체 택배사를 검토하거나 고객에게 사전 안내 메시지를 발송하세요.";
        } else if (text.includes('품질') || text.includes('터졌어요') || text.includes('불량')) {
            category = "상품 품질";
            sentiment = "부정";
            score = 15;
            actionItem = "포장재 내구성 이슈가 감지되었습니다. 에어캡 보강 또는 박스 규격 변경을 권장합니다.";
        } else if (text.includes('좋아요') || text.includes('최고') || text.includes('만족')) {
            category = "고객 만족";
            sentiment = "긍정";
            score = 95;
            actionItem = "현재 만족도가 매우 높습니다. 이 리뷰를 상세페이지 상단에 배치하여 구매 전환율을 높이세요.";
        }

        return { category, sentiment, actionItem, score };
    }

    /**
     * 결과를 화면에 렌더링
     */
    function renderResult(data) {
        const sentimentColor = data.sentiment === '긍정' ? 'var(--secondary)' : 'var(--accent)';
        
        analysisResult.innerHTML = `
            <div class="result-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div>
                        <span class="badge" style="background: ${sentimentColor}22; color: ${sentimentColor}; margin-bottom: 0.5rem;">${data.category}</span>
                        <h3 style="margin: 0;">AI 분석 리포트</h3>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-size: 0.8rem; color: var(--text-muted);">긍정 지수</span>
                        <div style="font-size: 1.5rem; font-weight: 800; color: ${sentimentColor}">${data.score}%</div>
                    </div>
                </div>
                <div style="background: rgba(0,0,0,0.02); padding: 1.2rem; border-radius: var(--radius-md); border-left: 4px solid ${sentimentColor}">
                    <strong style="display: block; margin-bottom: 0.5rem;">💡 추천 액션 아이템:</strong>
                    <p style="font-size: 0.95rem; color: var(--text-main); line-height: 1.5;">${data.actionItem}</p>
                </div>
            </div>
        `;
    }
});
