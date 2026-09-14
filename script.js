document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // إعدادات Supabase
    // ⚠️ تم الاحتفاظ بالعنوان والمفتاح الأصليين
    // =========================================================
    const SUPABASE_URL = 'https://ycwtrymlqepftuvgqxui.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_mO2nXgZyuQy3Fh1ry_20eg_CMszH3mS';
    const SUPABASE_TABLE = 'consultation_requests';
    const BUCKET_NAME = 'consultation-files';

    // حدود المرفقات
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 ميجابايت
    const ALLOWED_FILE_TYPES = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    // إنشاء عميل Supabase
    let supabase = null;
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

    // =========================================================
    // قائمة الهاتف المحمول
    // =========================================================
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '80px';
                navLinks.style.right = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = '#fff';
                navLinks.style.padding = '20px';
                navLinks.style.boxShadow = '0 5px 10px rgba(0,0,0,0.1)';
            }
        });
    }

    // =========================================================
    // الأسئلة الشائعة
    // =========================================================
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const icon = header.querySelector('i');
            document.querySelectorAll('.accordion-content').forEach(item => {
                if (item !== content) {
                    item.style.display = 'none';
                    const itemIcon = item.previousElementSibling?.querySelector('i');
                    if (itemIcon) itemIcon.className = 'fas fa-chevron-down';
                }
            });
            if (content.style.display === 'block') {
                content.style.display = 'none';
                if (icon) icon.className = 'fas fa-chevron-down';
            } else {
                content.style.display = 'block';
                if (icon) icon.className = 'fas fa-chevron-up';
            }
        });
    });

    // =========================================================
    // العدادات
    // =========================================================
    const counters = document.querySelectorAll('.counter');
    let countersAnimated = false;

    function startCounters() {
        counters.forEach(counter => {
            const target = Number(counter.getAttribute('data-target'));
            const duration = 2000;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                counter.innerText = Math.floor(progress * target);
                if (progress < 1) requestAnimationFrame(updateCounter);
                else counter.innerText = target;
            }
            requestAnimationFrame(updateCounter);
        });
    }

    window.addEventListener('scroll', () => {
        const statsSection = document.querySelector('.stats');
        if (statsSection && !countersAnimated) {
            if (statsSection.getBoundingClientRect().top < window.innerHeight) {
                startCounters();
                countersAnimated = true;
            }
        }
    });

    // =========================================================
    // دوال مساعدة للمرفقات
    // =========================================================

    // توليد اسم ملف آمن
    function generateSafeFilePath(originalName) {
        const ext = (originalName.split('.').pop() || 'bin').toLowerCase();
        const uuid = (crypto && crypto.randomUUID)
            ? crypto.randomUUID()
            : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        return `${Date.now()}_${uuid}.${ext}`;
    }

    // التحقق من صلاحية الملف
    function validateFile(file) {
        if (!file) return null;
        if (file.size > MAX_FILE_SIZE) return 'حجم الملف يتجاوز 5 ميجابايت.';
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return 'نوع الملف غير مسموح. الأنواع المسموحة: PDF, JPG, PNG, WEBP, DOC, DOCX.';
        }
        return null;
    }

    // رفع الملف وإرجاع المسار (وليس الرابط)
    async function uploadAttachment(file) {
        const err = validateFile(file);
        if (err) throw new Error(err);

        const filePath = generateSafeFilePath(file.name);
        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, { upsert: false, cacheControl: '3600' });

        if (uploadError) throw new Error('فشل رفع المرفق: ' + uploadError.message);
        return filePath;
    }

    // حذف الملف من التخزين (تنظيف)
    async function deleteAttachmentFromStorage(filePath) {
        if (!filePath) return;
        try {
            await supabase.storage.from(BUCKET_NAME).remove([filePath]);
        } catch (e) {
            console.warn('تعذر حذف المرفق:', e);
        }
    }

    // =========================================================
    // دالة عرض رسائل النموذج
    // =========================================================
    const formResponse = document.getElementById('formResponse');

    function showFormMessage(message, type) {
        if (!formResponse) return;
        formResponse.innerText = message;
        if (type === 'success') formResponse.style.color = '#10b981';
        else if (type === 'error') formResponse.style.color = '#dc2626';
        else formResponse.style.color = '#666';
    }

    // =========================================================
    // نموذج الاستشارة القانونية
    // =========================================================
    const leadForm = document.getElementById('leadForm');

    if (!leadForm) {
        console.error('لم يتم العثور على النموذج: #leadForm');
        return;
    }

    // فحص التكرار — يُعيد `true` إذا كان مكرراً ورفض المستخدم الإرسال
    async function isDuplicateRequest(fullName, phone, service) {
        const { data: existingRequests, error: checkError } = await supabase
            .from(SUPABASE_TABLE)
            .select('id, client_name, phone, service, created_at')
            .eq('client_name', fullName)
            .eq('phone', phone)
            .eq('service', service)
            .order('created_at', { ascending: false })
            .limit(1);

        if (checkError) {
            console.error('خطأ في فحص التكرار:', checkError);
            throw checkError;
        }

        if (!existingRequests || existingRequests.length === 0) return false;

        const lastRequest = existingRequests[0];
        const lastDate = new Date(lastRequest.created_at);
        const diffHours = (Date.now() - lastDate.getTime()) / 36e5;

        if (diffHours >= 24) return false;

        const userChoice = confirm(
            `⚠️ يوجد طلب سابق بنفس البيانات (${fullName} - ${phone}) بتاريخ ${lastDate.toLocaleString('ar-EG')}.\n\n` +
            `اضغط "موافق" إذا كان هذا هو نفس الطلب (لن يتم الحفظ).\n` +
            `اضغط "إلغاء" إذا كان هذا طلباً جديداً (سيتم الحفظ).`
        );

        return userChoice === true;
    }

    // =========================================================
    // معالج إرسال النموذج
    // =========================================================
    leadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!supabase) {
            showFormMessage('تعذر الاتصال بالخدمة. يرجى تحديث الصفحة.', 'error');
            return;
        }

        // قراءة البيانات
        const nameInput = document.getElementById('name');
        const phoneInput = document.getElementById('phone');
        const emailInput = document.getElementById('email');
        const companyInput = document.getElementById('company');
        const serviceInput = document.getElementById('service-type');
        const messageInput = document.getElementById('message');
        const privacyInput = document.getElementById('privacy');
        const attachmentInput = document.getElementById('attachment');

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

        // قفل زر الإرسال
        const submitButton = leadForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton ? submitButton.innerText : 'إرسال طلب الاستشارة';
        if (submitButton) { submitButton.disabled = true; submitButton.innerText = 'جاري إرسال الطلب...'; }

        showFormMessage('جاري إرسال طلب الاستشارة...', 'loading');

        let uploadedPath = null;

        try {
            // ===== 1) فحص التكرار أولاً (قبل رفع الملف) =====
            const duplicate = await isDuplicateRequest(fullName, phone, service);
            if (duplicate) {
                showFormMessage('تم إلغاء الإرسال لأن هذا الطلب موجود مسبقاً.', 'error');
                return;
            }

            // ===== 2) رفع المرفق (إن وُجد) =====
            const file = attachmentInput?.files?.[0] || null;
            if (file) {
                uploadedPath = await uploadAttachment(file);
            }

            // ===== 3) حفظ الطلب في قاعدة البيانات عبر Supabase Client =====
            const consultationData = {
                client_name: fullName,
                phone: phone,
                email: email || null,
                company: company || null,
                service: service || null,
                message: message || null,
                privacy_accepted: privacyAccepted,
                attachment_path: uploadedPath // 🔴 مسار فقط (وليس رابط)
            };

            const { error: insertError } = await supabase
                .from(SUPABASE_TABLE)
                .insert(consultationData);

            if (insertError) throw insertError;

            // نجاح الإرسال
            console.log('تم حفظ طلب الاستشارة بنجاح.');
            showFormMessage('تم استلام طلبك بنجاح! سيتواصل معك مستشارنا القانوني خلال 24 ساعة.', 'success');

            // تنظيف النموذج
            leadForm.reset();
            if (attachmentInput) attachmentInput.value = '';

        } catch (error) {
            console.error('خطأ في إرسال نموذج الاستشارة:', error);

            // تنظيف الملف المرفوع في حال فشل الحفظ
            if (uploadedPath) {
                await deleteAttachmentFromStorage(uploadedPath);
            }

            const msg = error?.message || 'حدث خطأ غير متوقع.';
            showFormMessage('حدث خطأ أثناء إرسال الطلب: ' + msg + ' — يرجى المحاولة مرة أخرى.', 'error');

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerText = originalButtonText;
            }
        }
    });
});