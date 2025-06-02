async function processImage() {
  const fileInput = document.getElementById('imageInput');
  const file = fileInput.files[0];
  if (!file) {
    alert("이미지를 선택하세요.");
    return;
  }

  const base64Image = await toBase64(file);

  // 1. OCR API 요청
  const ocrResponse = await fetch("http://api.ocr.space/parse/image", {
    method: "POST",
    headers: {
      "apikey": "OCR key"
    },
    body: new URLSearchParams({
      base64Image: base64Image,
      language: "kor",
      isOverlayRequired: "false"
    })
  });
  const ocrData = await ocrResponse.json();
  const extractedText = ocrData?.ParsedResults?.[0]?.ParsedText || "텍스트를 추출하지 못했습니다.";
  document.getElementById("extractedText").innerText = extractedText;

  // 2. GPT API 요청 (요약)

  const temptext = "기후 변화는 전 지구적인 문제로, 산업화 이후 온실가스 배출량이 급격히 증가하면서 지구 평균기온이 상승하고 있습니다. 이로 인해 해수면 상승, 이상 기후, 생태계 파괴 등의 문제가 발생하고 있으며, 국제사회는 파리협약 등을 통해 이를 해결하기 위한 노력을 이어가고 있습니다. 특히 에너지 소비 패턴의 전환과 재생에너지 확대는 중요한 대응 전략으로 꼽히고 있습니다"

  const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer Open api Key"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "다음 텍스트를 초등학생도 이해할 수 있도록 쉽게 요약해줘."
        },
        {
          role: "user",
          content: temptext
        }
      ]
    })
  });
  const gptData = await gptResponse.json();
  console.log(gptData);
  const summaryText = gptData.choices?.[0]?.message?.content || "요약 실패";
  document.getElementById("summaryText").innerText = summaryText;

  // 3. TTS 출력
  responsiveVoice.speak(temptext, "Korean Female");
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
