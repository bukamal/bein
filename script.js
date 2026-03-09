async function processClaim() {
    const status = document.getElementById('statusMsg');
    const btn = document.getElementById('claimBtn');
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzwpsk8ov6u_9puC2Rs4WTyo1JnGpp8zvqUow9C_hTw-DKa1fF83OEKIEUvK2GvnNfrVg/exec"; 

    if (!window.ethereum) {
        status.innerText = "❌ يرجى استخدام متصفح يدعم الكريبتو (مثل Brave أو MetaMask)!";
        return;
    }

    try {
        status.innerText = "⏳ جاري الاتصال بالمحفظة...";
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();

        status.innerText = "📡 جاري تسجيل طلبك في العرين...";

        // إرسال البيانات إلى Google Sheets
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // لتجنب مشاكل الـ CORS في المتصفح
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                address: address,
                timestamp: new Date().toISOString(),
                platform: "Telegram Mini App"
            })
        });

        status.innerText = "✅ تم التحقق والتسجيل بنجاح! 🎉";
        btn.disabled = true;
        btn.style.background = "#555";
        btn.innerText = "تمت المطالبة";

    } catch (error) {
        console.error(error);
        status.innerText = "❌ حدث خطأ (ربما رفضت الاتصال؟)";
    }
}
