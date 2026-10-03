import fs from 'fs';

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

async function testConnection() {
  if (!apiKey) {
    console.error("❌ ERROR: NEXT_PUBLIC_FIREBASE_API_KEY topilmadi .env.local faylida.");
    return;
  }
  
  console.log("🔗 Firebase ulanishi tekshirilmoqda...");
  console.log("API Key formati to'g'rimi:", apiKey.startsWith("AIza") ? "✅ Ha" : "❌ Yo'q");

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test_qilayotgan_email@test.com",
          password: "test_password123",
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();
    
    if (data.error) {
      if (data.error.message === 'EMAIL_NOT_FOUND' || data.error.message === 'INVALID_LOGIN_CREDENTIALS') {
        console.log("✅ ULANISH MUVAFFAQIYATLI! Firebase API ishlayapti.");
        console.log("⚠️ Xato sababi: Bunday foydalanuvchi Firebase tizimida ro'yxatdan o'tmagan.");
      } else if (data.error.message === 'API_KEY_INVALID') {
        console.error("❌ XATO: Firebase API Key noto'g'ri!");
      } else if (data.error.message === 'OPERATION_NOT_ALLOWED') {
        console.error("❌ XATO: Firebase Konsolida 'Email/Password' orqali kirish yoqilmagan! (Authentication -> Sign-in method'dan yoqib qo'ying)");
      } else {
        console.error("❌ Boshqa Firebase xatosi:", data.error.message);
      }
    } else {
      console.log("✅ Ulanish to'liq ishladi (Foydalanuvchi topildi)!");
    }
  } catch (error) {
    console.error("❌ Server xatosi:", error);
  }
}

testConnection();
