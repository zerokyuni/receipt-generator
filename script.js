// DOM(Document Object Model)이 완전히 로드된 후 스크립트 실행
document.addEventListener('DOMContentLoaded', function () {

    // HTML에서 필요한 요소들을 가져오기
    const addItemBtn = document.getElementById('add-item-btn');
    const itemList = document.getElementById('item-list');
    const generateBtn = document.getElementById('generate-btn');
    const pdfDownloadBtn = document.getElementById('pdf-download-btn');
    const logoUploadInput = document.getElementById('logo-upload');

    // 로고 이미지 파일을 Base64 문자열로 저장할 변수
    let logoBase64 = '';

    // 로고 파일이 업로드되면 Base64로 변환하여 저장
    logoUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            logoBase64 = '';
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            logoBase64 = reader.result;
        };
        reader.readAsDataURL(file);
    });

    // 상품 항목을 추가하는 함수
    const addItem = () => {
        const itemRow = document.createElement('div');
        itemRow.className = 'item-row bg-gray-50 p-3 rounded-lg border';
        
        // gap을 제거하고 각 col 내부에 padding(px-1)을 적용하여 충돌을 방지하는 최종 Grid 구조
        itemRow.innerHTML = `
            <div class="grid grid-cols-12 items-end">
                <div class="col-span-12 sm:col-span-5 px-1">
                    <label class="item-label">상품명</label>
                    <input type="text" class="form-input item-name" placeholder="예: 아이스 아메리카노">
                </div>
                <div class="col-span-4 sm:col-span-2 px-1 mt-2 sm:mt-0">
                    <label class="item-label">단가</label>
                    <input type="text" class="form-input item-price text-left" placeholder="단가">
                </div>
                <div class="col-span-4 sm:col-span-2 px-1 mt-2 sm:mt-0">
                    <label class="item-label">수량</label>
                    <input type="text" class="form-input item-quantity text-left" placeholder="수량">
                </div>
                <div class="col-span-4 sm:col-span-2 px-1 mt-2 sm:mt-0">
                    <label class="item-label">금액</label>
                    <input type="text" class="form-input item-total text-left" placeholder="금액">
                </div>
                <div class="col-span-12 sm:col-span-1 px-1 mt-2 sm:mt-0">
                    <button type="button" class="delete-item-btn h-10 w-full sm:w-10 flex items-center justify-center bg-red-500 text-white rounded-md hover:bg-red-600">&times;</button>
                </div>
            </div>
        `;
        itemList.appendChild(itemRow);
    };

    // 페이지 로드 시 기본으로 상품 1개 추가
    addItem();

    // 버튼 클릭 시 상품 추가
    addItemBtn.addEventListener('click', addItem);

    // 상품 목록 내 클릭 이벤트 처리 (이벤트 위임)
    itemList.addEventListener('click', (event) => {
        if (event.target.closest('.delete-item-btn')) {
            event.target.closest('.item-row').remove();
        }
    });

    // 영수증 HTML을 생성하는 공통 함수
    const createReceiptHtml = () => {
        const storeName = document.getElementById('store-name').value;
        const storeInfo = document.getElementById('store-info').value;
        const storeAddress = document.getElementById('store-address').value;
        const storePhone = document.getElementById('store-phone').value;
        const rawDatetime = document.getElementById('receipt-datetime').value;
        const datetime = rawDatetime ? new Date(rawDatetime).toLocaleString('ko-KR') : new Date().toLocaleString('ko-KR');
        const paymentMethod = document.getElementById('payment-method').value;
        const promoMessage = document.getElementById('promo-message').value;
        const subtotal = document.getElementById('subtotal-input').value;
        const tax = document.getElementById('tax-input').value;
        const total = document.getElementById('total-input').value;

        let itemsHtml = '';
        const itemRows = document.querySelectorAll('#item-list .item-row');
        itemRows.forEach(row => {
            const name = row.querySelector('.item-name').value;
            const price = row.querySelector('.item-price').value;
            const quantity = row.querySelector('.item-quantity').value;
            const itemTotal = row.querySelector('.item-total').value;
            itemsHtml += `
                <tr>
                    <td style="text-align: left; padding: 5px 2px; width: 40%;">${name}</td>
                    <td style="text-align: right; padding: 5px 2px; width: 20%;">${price}</td>
                    <td style="text-align: right; padding: 5px 2px; width: 15%;">${quantity}</td>
                    <td style="text-align: right; padding: 5px 2px; width: 25%;">${itemTotal}</td>
                </tr>
            `;
        });

        return `
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>영수증</title>
                <style>
                    body {
                        font-family: 'Malgun Gothic', 'Dotum', sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #fff;
                    }
                    .receipt-container {
                        margin: 0 auto;
                        color: #000;
                    }
                    @media screen {
                        body { background-color: #f0f0f0; padding: 20px; }
                        .receipt-container {
                            width: 100%;
                            max-width: 420px;
                            padding: 25px;
                            background-color: #fff;
                            box-shadow: 0 0 15px rgba(0,0,0,0.1);
                            font-size: 15px;
                            line-height: 1.6;
                        }
                    }
                    @media print {
                        body { background-color: #fff; padding: 0; }
                        .receipt-container {
                            width: 280px;
                            padding: 10px;
                            box-shadow: none;
                            font-size: 10px;
                            line-height: 1.4;
                        }
                    }
                    .center { text-align: center; }
                    .left { text-align: left; }
                    .right { text-align: right; }
                    .header { margin-bottom: 20px; }
                    .logo { max-width: 150px; max-height: 80px; margin: 0 auto 10px; display: block; }
                    .info-section { margin-bottom: 15px; }
                    .items-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                    .items-table th, .items-table td { padding: 6px 0; }
                    .items-table thead tr { border-top: 1px dashed #000; border-bottom: 1px dashed #000; }
                    .totals-section { border-top: 1px dashed #000; padding-top: 10px; margin-top: 15px; }
                    .totals-section div { display: flex; justify-content: space-between; padding: 3px 0; }
                    .footer { border-top: 1px dashed #000; padding-top: 10px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="receipt-container">
                    <div class="header center">
                        ${logoBase64 ? `<img src="${logoBase64}" alt="logo" class="logo">` : ''}
                        <h2 style="font-size: 1.5em; margin: 0;">${storeName}</h2>
                        <p style="margin: 2px 0;">${storeInfo}</p>
                        <p style="margin: 2px 0;">${storeAddress}</p>
                        <p style="margin: 2px 0;">TEL: ${storePhone}</p>
                    </div>
                    <div class="info-section">
                        <p><strong>일자:</strong> ${datetime}</p>
                    </div>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th class="left">상품명</th>
                                <th class="right">단가</th>
                                <th class="right">수량</th>
                                <th class="right">금액</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    <div class="totals-section">
                        <div><span>합계:</span><span>${subtotal}</span></div>
                        <div><span>부가세:</span><span>${tax}</span></div>
                        <div style="font-size: 1.2em;"><strong>최종 합계:</strong><strong>${total}</strong></div>
                    </div>
                    <div class="footer center">
                        <p><strong>결제수단:</strong> ${paymentMethod}</p>
                        <p>${promoMessage}</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    };

    // '영수증 생성 (새 창)' 버튼 클릭 이벤트
    generateBtn.addEventListener('click', () => {
        const receiptHtml = createReceiptHtml();
        const receiptWindow = window.open('', '_blank');
        receiptWindow.document.write(receiptHtml);
        receiptWindow.document.close();
    });

    // 'PDF로 다운로드' 버튼 클릭 이벤트
    pdfDownloadBtn.addEventListener('click', () => {
        const receiptHtml = createReceiptHtml();
        
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        document.body.appendChild(iframe);
        
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(receiptHtml);
        iframe.contentWindow.document.close();

        iframe.onload = function() {
            const receiptBody = iframe.contentWindow.document.body;
            const receiptContainer = receiptBody.querySelector('.receipt-container');
            
            receiptBody.style.backgroundColor = '#fff';
            receiptBody.style.padding = '0';
            receiptContainer.style.width = '280px';
            receiptContainer.style.padding = '10px';
            receiptContainer.style.fontSize = '10px';
            receiptContainer.style.lineHeight = '1.4';
            receiptContainer.style.boxShadow = 'none';

            html2canvas(receiptContainer, {
                scale: 2,
                useCORS: true
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const { jsPDF } = window.jspdf;
                
                // 이미지 속성을 가져와서 실제 높이를 계산합니다.
                const tempPdf = new jsPDF();
                const imgProps = tempPdf.getImageProperties(imgData);
                const pdfWidth = 76; // 80mm 페이지 너비 - 4mm 여백
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                const pageHeight = pdfHeight + 4; // 상하 여백 4mm 추가

                // 계산된 높이로 PDF 문서를 생성합니다.
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: [80, pageHeight] // 고정된 A4 높이 대신 계산된 높이 사용
                });

                pdf.addImage(imgData, 'PNG', 2, 2, pdfWidth, pdfHeight);
                pdf.save('receipt.pdf');

                document.body.removeChild(iframe);
            });
        };
    });
});
