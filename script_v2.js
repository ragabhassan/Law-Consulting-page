document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // إعدادات Supabase (داخل الدالة لضمان تحميل المكتبة أولاً)
    // =========================================================
    const SUPABASE_URL = 'https://wacvbnebicbutyzpnkez.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhY3ZibmViaWNidXR5enBua2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxODYzMjEsImV4cCI6MjEwMTc2MjMyMX0.NEjwCs4ZBcoJT9ZVxNnYaZRY1-DIUjk-aNqV3rs5A4w';
    const SUPABASE_TABLE = 'consultation_requests';
    
    // 🔴 إنشاء عميل Supabase داخل الدالة
    let supabase;
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
        console.error('فشل تحميل مكتبة Supabase:', e);
    }

    // =========================================================
    // تهيئة AOS
    // =========================================================
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true, offset: 100 });
    }

    // ... (باقي الكود كما هو: القائمة، الأسئلة الشائعة، العدادات، إلخ) ...

    // =========================================================
    // نموذج الاستشارة القانونية
    // =========================================================
    const leadForm = document.getElementById('leadForm');
    const formResponse = document.getElementById('formResponse');

    if (!leadForm) {
        console.error('لم يتم العثور على النموذج: #leadForm');
        return;
    }

    leadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // قراءة البيانات
        const nameInput = document.getElementById('name');
        const phoneInput = document.getElementById('phone');
        const emailInput = document.getElementById('email');
        const companyInput = document.getElementById('company');
        const serviceInput = document.getElementById('service-type');
        const messageInput = document.getElementById('message');
        const privacyInput = document.getElementById('privacy');

        const fullName = nameInput ? nameInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const company = companyInput ? companyInput.value.trim() : '';
        const service = serviceInput ? serviceInput.value.trim() : '';
        const message = messageInput ? messageInput.value.trim() : '';
        const privacyAccepted = privacyInput ? privacyInput.checked : false;

        // التحقق من البيانات الأساسية
        if (!fullName) { showFormMessage('من فضلك أدخل الاسم.', 'error'); nameInput.focus(); return; }
        if (!phone) { showFormMessage('من فضلك أدخل رقم الهاتف.', 'error'); phoneInput.focus(); return; }
        if (!service) { showFormMessage('من فضلك اختر نوع الخدمة المطلوبة.', 'error'); serviceInput.focus(); return; }
        if (!privacyAccepted) { showFormMessage('يجب الموافقة على سياسة الخصوصية قبل إرسال الطلب.', 'error'); privacyInput.focus(); return; }

        // منع الإرسال المزدوج
        const submitButton = leadForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton ? submitButton.innerText : 'إرسال طلب الاستشارة';
        if (submitButton) { submitButton.disabled = true; submitButton.innerText = 'جاري إرسال الطلب...'; }
        showFormMessage('جاري إرسال طلب الاستشارة...', 'loading');

        // 🔴 فحص التكرار
        try {
            const { data: existingRequests, error: checkError } = await supabase
                .from('consultation_requests')
                .select('id, client_name, phone, service, created_at')
                .eq('client_name', fullName)
                .eq('phone', phone)
                .eq('service', service)
                .order('created_at', { ascending: false })
                .limit(1);

            if (checkError) {
                console.error('خطأ في فحص التكرار:', checkError);
                throw new Error(checkError.message);
            }

            if (existingRequests && existingRequests.length > 0) {
                const lastRequest = existingRequests[0];
                const lastDate = new Date(lastRequest.created_at);
                const now = new Date();
                const diffHours = (now - lastDate) / (1000 * 60 * 60);

                if (diffHours < 24) {
                    const userChoice = confirm(
                        `⚠️ يوجد طلب سابق بنفس البيانات (${fullName} - ${phone}) بتاريخ ${lastDate.toLocaleString('ar-EG')}.\n\n` +
                        `اضغط "موافق" إذا كان هذا هو نفس الطلب (لن يتم الحفظ).\n` +
                        `اضغط "إلغاء" إذا كان هذا طلباً جديداً (سيتم الحفظ).`
                    );

                    if (userChoice) {
                        showFormMessage('تم إلغاء الإرسال لأن هذا الطلب موجود مسبقاً.', 'error');
                        if (submitButton) { submitButton.disabled = false; submitButton.innerText = originalButtonText; }
                        return;
                    }
                }
            }
        } catch (checkErr) {
            console.error('تعذر فحص التكرار:', checkErr);
            showFormMessage('حدث خطأ أثناء التحقق من الطلب.', 'error');
            if (submitButton) { submitButton.disabled = false; submitButton.innerText = originalButtonText; }
            return;
        }

        try {
            // تجهيز البيانات
            const consultationData = {
    client_name: fullName,
    full_name: fullName, // 🔴 أضف هذا السطر
    phone: phone,
    email: email || null,
    company: company || null,
    service: service || null,
    message: message || null,
    privacy_accepted: true
};

            // حفظ البيانات في قاعدة البيانات
            const response = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(consultationData)
            });

            if (!response.ok) {
                let errorMessage = 'حدث خطأ أثناء حفظ الطلب.';
                try {
                    const errorData = await response.json();
                    console.error('Supabase Error:', errorData);
                    if (errorData.message) errorMessage = errorData.message;
                    else if (errorData.hint) errorMessage = errorData.hint;
                } catch (jsonError) {
                    const text = await response.text();
                    console.error('Supabase Error Response:', text);
                }
                throw new Error(errorMessage);
            }

            // (اختياري) إرسال إشعار التليجرام - سنتجاهله الآن لتجنب أي مشاكل CORS

            // نجاح الإرسال
            console.log('تم حفظ طلب الاستشارة بنجاح في Supabase.');
            showFormMessage('تم استلام طلبك بنجاح! سيتواصل معك مستشارنا القانوني خلال 24 ساعة.', 'success');

            // تنظيف النموذج
            leadForm.reset();

        } catch (error) {
            console.error('خطأ في إرسال نموذج الاستشارة:', error);
            showFormMessage('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى أو التواصل معنا عبر الهاتف أو واتساب.', 'error');
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerText = originalButtonText;
            }
        }
    });

    // دالة عرض رسائل النموذج
    function showFormMessage(message, type) {
        if (!formResponse) return;
        formResponse.innerText = message;
        if (type === 'success') formResponse.style.color = '#10b981';
        else if (type === 'error') formResponse.style.color = '#dc2626';
        else formResponse.style.color = '#666';
    }
});