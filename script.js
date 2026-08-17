document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // إعدادات Supabase
    // =========================================================

    const SUPABASE_URL =
        'https://wacvbnebicubtyzpnkez.supabase.co';

    const SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhY3ZibmViaWNidXR5enBua2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxODYzMjEsImV4cCI6MjEwMTc2MjMyMX0.NEjwCs4ZBcoJT9ZVxNnYaZRY1-DIUjk-aNqV3rs5A4w';

    const SUPABASE_TABLE = 'consultation_requests';


    // =========================================================
    // تهيئة AOS
    // =========================================================

    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100
        });
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
                navLinks.style.boxShadow =
                    '0 5px 10px rgba(0,0,0,0.1)';
            }
        });
    }


    // =========================================================
    // الأسئلة الشائعة
    // =========================================================

    const accordionHeaders =
        document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {

        header.addEventListener('click', () => {

            const content = header.nextElementSibling;
            const icon = header.querySelector('i');

            document
                .querySelectorAll('.accordion-content')
                .forEach(item => {

                    if (item !== content) {

                        item.style.display = 'none';

                        const itemIcon =
                            item.previousElementSibling?.querySelector('i');

                        if (itemIcon) {
                            itemIcon.className =
                                'fas fa-chevron-down';
                        }
                    }
                });

            if (content.style.display === 'block') {

                content.style.display = 'none';

                if (icon) {
                    icon.className = 'fas fa-chevron-down';
                }

            } else {

                content.style.display = 'block';

                if (icon) {
                    icon.className = 'fas fa-chevron-up';
                }
            }
        });
    });


    // =========================================================
    // العدادات
    // =========================================================

    const counters =
        document.querySelectorAll('.counter');

    let countersAnimated = false;

    function startCounters() {

        counters.forEach(counter => {

            const target =
                Number(counter.getAttribute('data-target'));

            const duration = 2000;
            const startTime = performance.now();

            function updateCounter(currentTime) {

                const elapsed =
                    currentTime - startTime;

                const progress =
                    Math.min(elapsed / duration, 1);

                const currentValue =
                    Math.floor(progress * target);

                counter.innerText = currentValue;

                if (progress < 1) {

                    requestAnimationFrame(updateCounter);

                } else {

                    counter.innerText = target;
                }
            }

            requestAnimationFrame(updateCounter);
        });
    }


    // =========================================================
    // التمرير + زر العودة للأعلى
    // =========================================================

    window.addEventListener('scroll', () => {

        const statsSection =
            document.querySelector('.stats');

        if (statsSection && !countersAnimated) {

            const sectionPosition =
                statsSection.getBoundingClientRect().top;

            if (sectionPosition < window.innerHeight) {

                startCounters();

                countersAnimated = true;
            }
        }

        const backToTopBtn =
            document.getElementById('backToTop');

        if (backToTopBtn) {

            if (window.scrollY > 300) {

                backToTopBtn.style.display = 'block';

            } else {

                backToTopBtn.style.display = 'none';
            }
        }
    });


    // =========================================================
    // زر العودة للأعلى
    // =========================================================

    const backToTopBtn =
        document.getElementById('backToTop');

    if (backToTopBtn) {

        backToTopBtn.addEventListener('click', () => {

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

        });
    }


    // =========================================================
    // نموذج الاستشارة القانونية
    // =========================================================

    const leadForm =
        document.getElementById('leadForm');

    const formResponse =
        document.getElementById('formResponse');


    if (!leadForm) {

        console.error(
            'لم يتم العثور على النموذج: #leadForm'
        );

        return;
    }


    leadForm.addEventListener('submit', async (event) => {

        event.preventDefault();


        // -----------------------------------------------------
        // عناصر النموذج
        // -----------------------------------------------------

        const nameInput =
            document.getElementById('name');

        const phoneInput =
            document.getElementById('phone');

        const emailInput =
            document.getElementById('email');

        const companyInput =
            document.getElementById('company');

        const serviceInput =
            document.getElementById('service-type');

        const messageInput =
            document.getElementById('message');

        const privacyInput =
            document.getElementById('privacy');


        // -----------------------------------------------------
        // قراءة البيانات
        // -----------------------------------------------------

        const fullName =
            nameInput ? nameInput.value.trim() : '';

        const phone =
            phoneInput ? phoneInput.value.trim() : '';

        const email =
            emailInput ? emailInput.value.trim() : '';

        const company =
            companyInput ? companyInput.value.trim() : '';

        const service =
            serviceInput ? serviceInput.value.trim() : '';

        const message =
            messageInput ? messageInput.value.trim() : '';

        const privacyAccepted =
            privacyInput ? privacyInput.checked : false;


        // -----------------------------------------------------
        // التحقق من البيانات الأساسية
        // -----------------------------------------------------

        if (!fullName) {

            showFormMessage(
                'من فضلك أدخل الاسم.',
                'error'
            );

            if (nameInput) nameInput.focus();

            return;
        }


        if (!phone) {

            showFormMessage(
                'من فضلك أدخل رقم الهاتف.',
                'error'
            );

            if (phoneInput) phoneInput.focus();

            return;
        }


        if (!service) {

            showFormMessage(
                'من فضلك اختر نوع الخدمة المطلوبة.',
                'error'
            );

            if (serviceInput) serviceInput.focus();

            return;
        }


        if (!privacyAccepted) {

            showFormMessage(
                'يجب الموافقة على سياسة الخصوصية قبل إرسال الطلب.',
                'error'
            );

            if (privacyInput) privacyInput.focus();

            return;
        }


        // -----------------------------------------------------
        // زر الإرسال
        // -----------------------------------------------------

        const submitButton =
            leadForm.querySelector('button[type="submit"]');

        const originalButtonText =
            submitButton
                ? submitButton.innerText
                : 'إرسال طلب الاستشارة';


        if (submitButton) {

            submitButton.disabled = true;

            submitButton.innerText =
                'جاري إرسال الطلب...';
        }


        showFormMessage(
            'جاري إرسال طلب الاستشارة...',
            'loading'
        );


        try {

            // -------------------------------------------------
            // تجهيز البيانات
            // -------------------------------------------------

            const consultationData = {

                full_name: fullName,

                phone: phone,

                email: email || null,

                company: company || null,

                service: service || null,

                message: message || null,

                privacy_accepted: true
            };


            console.log(
                'إرسال البيانات إلى Supabase:',
                consultationData
            );


            // -------------------------------------------------
            // الاتصال بـ Supabase
            // -------------------------------------------------

            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`,
                {
                    method: 'POST',

                    headers: {

                        'Content-Type':
                            'application/json',

                        'apikey':
                            SUPABASE_ANON_KEY,

                        'Authorization':
                            `Bearer ${SUPABASE_ANON_KEY}`,

                        'Prefer':
                            'return=minimal'
                    },

                    body:
                        JSON.stringify(consultationData)
                }
            );


            // -------------------------------------------------
            // في حالة وجود خطأ من Supabase
            // -------------------------------------------------

            if (!response.ok) {

                let errorMessage =
                    'حدث خطأ أثناء حفظ الطلب.';

                try {

                    const errorData =
                        await response.json();

                    console.error(
                        'Supabase Error:',
                        errorData
                    );

                    if (errorData.message) {

                        errorMessage =
                            errorData.message;

                    } else if (errorData.hint) {

                        errorMessage =
                            errorData.hint;
                    }

                } catch (jsonError) {

                    const text =
                        await response.text();

                    console.error(
                        'Supabase Error Response:',
                        text
                    );
                }


                throw new Error(errorMessage);
            }


            // -------------------------------------------------
            // نجاح الإرسال
            // -------------------------------------------------

            console.log(
                'تم حفظ طلب الاستشارة بنجاح في Supabase.'
            );


            showFormMessage(
                'تم استلام طلبك بنجاح! سيتواصل معك مستشارنا القانوني خلال 24 ساعة.',
                'success'
            );


            // تنظيف النموذج بعد نجاح الحفظ فقط
            leadForm.reset();


        } catch (error) {

            console.error(
                'خطأ في إرسال نموذج الاستشارة:',
                error
            );


            showFormMessage(
                'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى أو التواصل معنا عبر الهاتف أو واتساب.',
                'error'
            );

        } finally {

            // -------------------------------------------------
            // إعادة زر الإرسال
            // -------------------------------------------------

            if (submitButton) {

                submitButton.disabled = false;

                submitButton.innerText =
                    originalButtonText;
            }
        }

    });


    // =========================================================
    // دالة عرض رسائل النموذج
    // =========================================================

    function showFormMessage(message, type) {

        if (!formResponse) {
            return;
        }


        formResponse.innerText =
            message;


        if (type === 'success') {

            formResponse.style.color =
                '#10b981';

        } else if (type === 'error') {

            formResponse.style.color =
                '#dc2626';

        } else {

            formResponse.style.color =
                '#666';
        }
    }

});