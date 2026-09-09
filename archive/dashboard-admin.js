// ====== دوال التبديل بين الأقسام ======
function showSection(sectionName) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));

    // إظهار القسم المطلوب
    const target = document.getElementById('section-' + sectionName);
    if (target) {
        target.classList.add('active');
    } else {
        console.error('القسم غير موجود:', sectionName);
        return;
    }

    // استدعاء الدالة المناسبة لجلب البيانات حسب القسم
    if (sectionName === 'consultations') {
        fetchAllConsultations();
    } else if (sectionName === 'employees') {
        fetchEmployeesList();
    }
}

// ====== دوال جلب وعرض جميع الاستشارات ======
async function fetchAllConsultations() {
    console.log('جاري جلب جميع الاستشارات...');

    const { data, error } = await supabase
        .from('consultation_requests') // تأكد من اسم الجدول الصحيح
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('خطأ في جلب الاستشارات:', error);
        alert('حدث خطأ أثناء جلب البيانات: ' + error.message);
        return;
    }

    console.log('عدد الاستشارات المسترجعة:', data ? data.length : 0);
    renderConsultations(data);
}

function renderConsultations(consultations) {
    const tableBody = document.getElementById('consultations-table-body');
    if (!tableBody) {
        console.error('عنصر الجدول (consultations-table-body) غير موجود في الصفحة');
        return;
    }

    if (!consultations || consultations.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">لا توجد استشارات لعرضها</td></tr>';
        return;
    }

    let html = '';
    consultations.forEach((item, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.client_name || 'غير محدد'}</td>
                <td>${item.email || ''}</td>
                <td>${item.phone || ''}</td>
                <td>${item.status || 'جديد'}</td>
                <td>${new Date(item.created_at).toLocaleDateString('ar-EG')}</td>
            </tr>
        `;
    });
    tableBody.innerHTML = html;
}

// ====== دوال جلب وعرض الموظفين ======
async function fetchEmployeesList() {
    console.log('جاري جلب قائمة الموظفين...');

    const { data, error } = await supabase
        .from('profiles') // تأكد من اسم الجدول الصحيح
        .select('*')
        .eq('role', 'employee')
        .order('name');

    if (error) {
        console.error('خطأ في جلب الموظفين:', error);
        alert('حدث خطأ أثناء جلب بيانات الموظفين');
        return;
    }

    console.log('عدد الموظفين:', data ? data.length : 0);
    renderEmployees(data);
}

function renderEmployees(employees) {
    const listContainer = document.getElementById('employees-list-container');
    if (!listContainer) {
        console.error('عنصر قائمة الموظفين غير موجود');
        return;
    }

    if (!employees || employees.length === 0) {
        listContainer.innerHTML = '<p>لا يوجد موظفون مسجلون</p>';
        return;
    }

    let html = '<ul>';
    employees.forEach(emp => {
        html += `<li>${emp.name} (${emp.email}) - الحالة: ${emp.status || 'نشط'}</li>`;
    });
    html += '</ul>';
    listContainer.innerHTML = html;
}

// ====== دوال إضافة موظف جديد (اختياري) ======
async function addNewEmployee() {
    // ... (يمكنك وضع الكود الذي تم الاتفاق عليه سابقاً هنا)
    alert('سيتم تفعيل إضافة الموظف قريباً');
}

// ====== دوال تسجيل الخروج ======
async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        alert('حدث خطأ أثناء تسجيل الخروج: ' + error.message);
    } else {
        window.location.href = 'index.html'; // أو صفحة تسجيل الدخول
    }
}

// ====== تحميل البيانات عند بدء الصفحة (اختياري) ======
document.addEventListener('DOMContentLoaded', function() {
    // افتراضياً، عرض قسم الاستشارات عند تحميل الصفحة
    showSection('consultations');
});
