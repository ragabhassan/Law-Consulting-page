<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة التحكم - الاستشارات القانونية</title>
    
    <!-- أيقونة الموقع (تم إصلاح خطأ 404) -->
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚖️</text></svg>">
    
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f4f6f9; padding: 20px; }
        .container { max-width: 1400px; margin: 0 auto; background: white; border-radius: 16px; padding: 25px; box-shadow: 0 8px 30px rgba(0,0,0,0.1); }
        h1 { color: #1a2a3a; border-bottom: 3px solid #2d7aff; padding-bottom: 12px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; }
        .user-info { font-size: 16px; font-weight: normal; color: #555; }
        .nav-bar { display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 30px; background: #eef2f7; padding: 15px; border-radius: 12px; }
        .nav-btn { background: white; border: none; padding: 12px 28px; border-radius: 30px; font-size: 16px; font-weight: 600; color: #1a2a3a; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.08); transition: 0.3s; border: 1px solid transparent; }
        .nav-btn:hover { background: #2d7aff; color: white; box-shadow: 0 6px 14px rgba(45,122,255,0.3); transform: translateY(-2px); }
        .nav-btn.logout { background: #ff4d4d; color: white; }
        .nav-btn.logout:hover { background: #cc0000; }
        .nav-btn.hidden { display: none; }
        .section { display: none; animation: fadeIn 0.4s ease; }
        .section.active { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .filters { display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 25px; background: #f8faff; padding: 15px; border-radius: 12px; align-items: center; }
        .filters label { font-weight: 600; color: #1a2a3a; }
        .filters input, .filters select { padding: 8px 14px; border: 1px solid #dce1e8; border-radius: 8px; font-size: 14px; }
        .filters button { background: #2d7aff; color: white; border: none; padding: 8px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .filters button:hover { background: #1a5cc4; }
        .filters button.reset { background: #6c757d; }
        .table-responsive { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        th { background: #2d7aff; color: white; padding: 12px 10px; text-align: center; font-weight: 600; white-space: nowrap; }
        td { padding: 10px; border-bottom: 1px solid #e9edf4; text-align: center; vertical-align: middle; }
        tr:hover td { background: #f8faff; }
        .btn-preview { background: #17a2b8; color: white; border: none; padding: 4px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; }
        .btn-preview:hover { background: #138496; }
        .btn-save-assign { background: #28a745; color: white; border: none; padding: 4px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; }
        .btn-save-assign:hover { background: #218838; }
        select.assigned-select { padding: 4px 8px; border-radius: 6px; border: 1px solid #dce1e8; font-size: 13px; width: 100%; max-width: 200px; }
        .btn-edit-cons { background: #ffc107; color: #000; border: none; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; margin: 0 4px; }
        .btn-edit-cons:hover { background: #e0a800; }
        .btn-delete-cons { background: #dc3545; color: white; border: none; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 12px; margin: 0 4px; }
        .btn-delete-cons:hover { background: #c82333; }
        .employee-card { background: #f8faff; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; border-right: 5px solid #2d7aff; flex-wrap: wrap; gap: 10px; }
        .employee-card .info { display: flex; gap: 30px; flex-wrap: wrap; }
        .employee-card .info strong { color: #1a2a3a; }
        .employee-card .actions { display: flex; gap: 8px; }
        .employee-card .actions button { padding: 4px 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; }
        .btn-edit-emp { background: #ffc107; color: #000; }
        .btn-edit-emp:hover { background: #e0a800; }
        .btn-delete-emp { background: #dc3545; color: white; }
        .btn-delete-emp:hover { background: #c82333; }
        .message { padding: 16px; background: #fff3cd; border-radius: 10px; border-right: 6px solid #ffc107; margin: 20px 0; }
        .message.error { background: #f8d7da; border-color: #dc3545; }
        .message.success { background: #d4edda; border-color: #28a745; }
        .loading { text-align: center; padding: 40px; color: #6c757d; }
        .modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; animation: fadeInModal 0.3s ease; }
        .modal-overlay.active { display: flex; }
        @keyframes fadeInModal { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .modal-content { background: white; border-radius: 16px; max-width: 800px; width: 95%; max-height: 90vh; overflow-y: auto; padding: 25px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); position: relative; }
        .modal-close { position: sticky; top: 0; float: left; background: #dc3545; color: white; border: none; border-radius: 50%; width: 34px; height: 34px; font-size: 20px; cursor: pointer; margin-bottom: 15px; display: flex; align-items: center; justify-content: center; }
        .modal-close:hover { background: #c82333; }
        .modal-title { font-size: 24px; color: #1a2a3a; border-bottom: 2px solid #2d7aff; padding-bottom: 12px; margin-bottom: 20px; }
        .modal-section { margin-bottom: 20px; }
        .modal-section h3 { color: #2d7aff; margin-bottom: 10px; font-size: 18px; border-bottom: 1px solid #e9edf4; padding-bottom: 6px; }
        .modal-detail-row { display: flex; padding: 6px 0; border-bottom: 1px dashed #f0f2f5; }
        .modal-detail-row .label { font-weight: 600; width: 130px; color: #1a2a3a; }
        .modal-detail-row .value { flex: 1; color: #333; }
        .followup-item { background: #f8faff; padding: 10px 14px; border-radius: 8px; margin-bottom: 8px; border-right: 3px solid #2d7aff; }
        .followup-item .date { font-size: 12px; color: #6c757d; }
        .followup-item .note { margin-top: 4px; }
        .add-followup-form { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
        .add-followup-form input, .add-followup-form textarea { flex: 1; min-width: 150px; padding: 8px 12px; border: 1px solid #dce1e8; border-radius: 6px; }
        .add-followup-form button { background: #28a745; color: white; border: none; padding: 8px 20px; border-radius: 6px; cursor: pointer; }
        .add-employee-form { background: #f8faff; padding: 20px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e9edf4; }
        .add-employee-form .form-row { display: flex; gap: 15px; flex-wrap: wrap; align-items: end; }
        .add-employee-form .form-group { flex: 1; min-width: 150px; }
        .add-employee-form label { display: block; font-weight: 600; font-size: 14px; margin-bottom: 4px; }
        .add-employee-form input, .add-employee-form select { width: 100%; padding: 8px 12px; border: 1px solid #dce1e8; border-radius: 6px; }
        .add-employee-form button { background: #28a745; color: white; border: none; padding: 8px 24px; border-radius: 6px; cursor: pointer; font-weight: 600; }
        .add-employee-form button:hover { background: #218838; }
        .staff-msg { display: block; margin-top: 10px; padding: 10px; border-radius: 8px; }
        .staff-msg.success { background: #d4edda; color: #155724; }
        .staff-msg.error { background: #f8d7da; color: #721c24; }
        @media (max-width: 700px) { .nav-bar { flex-direction: column; } .nav-btn { width: 100%; text-align: center; } .filters { flex-direction: column; align-items: stretch; } .employee-card { flex-direction: column; align-items: flex-start; } .add-employee-form .form-row { flex-direction: column; } .modal-content { padding: 15px; } .modal-detail-row { flex-direction: column; } .modal-detail-row .label { width: 100%; } }
        
        /* ====== نافذة المعاينة (ملء الشاشة) ====== */
        .modal-overlay { background: rgba(10, 16, 28, 0.75); }
        .modal-content { width: 100%; height: 100vh; max-width: none; max-height: none; border-radius: 0; padding: 20px 30px; background: #f4f6f9; box-shadow: none; display: flex; flex-direction: column; }
        .modal-close { position: absolute; left: 20px; top: 15px; background: #dc3545; color: white; border-radius: 50%; width: 40px; height: 40px; font-size: 20px; z-index: 100; }
        .modal-title { font-size: 28px; color: #1a2a3a; border-bottom: 3px solid #2d7aff; padding-bottom: 10px; margin-bottom: 15px; text-align: right; position: relative; }
        
        /* ====== بنية النظام (Grid بالعرض) ====== */
        .dashboard-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; overflow-y: auto; padding: 10px; flex-grow: 1; }
        
        /* ====== البطاقة (Card) ====== */
        .dashboard-card { background: #ffffff; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); padding: 20px; border: 1px solid #e9edf4; transition: all 0.3s ease; }
        .dashboard-card:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.12); }
        .dashboard-card-header { display: flex; align-items: center; justify-content: flex-start; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
        .dashboard-card-header h3 { font-size: 17px; color: #1a2a3a; margin: 0; }
        .dashboard-card-header .icon-circle { width: 35px; height: 35px; border-radius: 12px; background: linear-gradient(135deg, #2d7aff, #1a5cc4); display: flex; align-items: center; justify-content: center; font-size: 18px; color: white; }
        .dashboard-detail-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f0f2f5; }
        .dashboard-detail-row:last-child { border-bottom: none; }
        .dashboard-detail-label { font-weight: 700; color: #333; font-size: 13px; width: 110px; margin: 0; }
        .dashboard-detail-value { flex: 1; color: #555; font-size: 13px; }
        .dashboard-checkbox-item { padding: 6px; border-bottom: 1px dashed #eee; font-size: 13px; background: #f0f4ff; border-radius: 6px; margin-bottom: 6px; }
        .dashboard-checkbox-item input[type="checkbox"] { margin-left: 8px; }
        .dashboard-checkbox-item label { font-size: 13px; color: #333; }
        .dashboard-followup-item { padding: 10px; border-radius: 10px; background: #f8faff; margin-bottom: 8px; border-right: 4px solid #2d7aff; }
        .dashboard-followup-item .date { font-size: 12px; color: #6c757d; margin-bottom: 4px; }
        .dashboard-followup-item .note { font-size: 13px; color: #333; }
        .dashboard-attachment-item { padding: 8px; border-radius: 10px; background: #f0f4ff; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
        .dashboard-attachment-item a { color: #2d7aff; text-decoration: none; margin-left: 10px; }
        .dashboard-attachment-item .btn-delete-attachment { background: #dc3545; color: white; border: none; border-radius: 6px; padding: 3px 8px; font-size: 10px; cursor: pointer; }
        .dashboard-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
        .dashboard-form-grid input, .dashboard-form-grid textarea { width: 100%; padding: 10px; border: 1px solid #dce1e8; border-radius: 8px; font-size: 13px; }
        .dashboard-form-grid button { width: 100%; }
        .dashboard-btn { background: #2d7aff; color: white; border: none; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; margin-top: 10px; }
        .dashboard-btn:hover { background: #1a5cc4; }
        
        /* خلفيات البطاقات */
        .dashboard-card:nth-child(1) .icon-circle { background: linear-gradient(135deg, #17a2b8, #138496); }
        .dashboard-card:nth-child(2) .icon-circle { background: linear-gradient(135deg, #28a745, #218838); }
        .dashboard-card:nth-child(3) .icon-circle { background: linear-gradient(135deg, #ffc107, #e0a800); }
        .dashboard-card:nth-child(4) .icon-circle { background: linear-gradient(135deg, #6c757d, #5a6268); }
        .dashboard-card:nth-child(5) .icon-circle { background: linear-gradient(135deg, #ff4d4d, #cc0000); }
        .dashboard-card:nth-child(6) .icon-circle { background: linear-gradient(135deg, #2d7aff, #1a5cc4); }
        
        @media (max-width: 900px) { .dashboard-container { grid-template-columns: 1fr; } .dashboard-detail-row { flex-direction: column; align-items: flex-start; gap: 2px; } .dashboard-detail-label { width: 100%; } }
    </style>
</head>
<body>

<div class="container">
    <h1 id="pageTitle">🏛️ لوحة التحكم <span class="user-info" id="userNameDisplay"></span></h1>
    <div class="nav-bar">
        <button class="nav-btn" id="btnShowConsultations">📋 عرض الطلبات</button>
        <button class="nav-btn hidden" id="btnManualEntry">📝 إدخال طلب يدوي</button>
        <button class="nav-btn hidden" id="btnShowEmployees">👥 إدارة الموظفين</button>
        <button class="nav-btn logout" id="btnLogout">🚪 تسجيل الخروج</button>
    </div>

    <!-- ====== قسم الطلبات ====== -->
    <div id="sectionConsultations" class="section active">
        <h2>📋 قائمة الطلبات</h2>
        <div class="filters" id="filterContainer">
            <label>📅 من:</label><input type="date" id="filterDateFrom">
            <label>إلى:</label><input type="date" id="filterDateTo">
            <label>📌 الخدمة:</label>
            <select id="filterService">
                <option value="">الكل</option>
                <option value="corporate">استشارات الشركات</option>
                <option value="contracts">صياغة العقود</option>
                <option value="litigation">قضايا وتقاضي</option>
                <option value="arbitration">تحكيم وتسوية نزاعات</option>
                <option value="ip">حماية الملكية الفكرية</option>
                <option value="other">استشارة عامة</option>
            </select>
            <!-- تم إضافة فلتر الموظف -->
            <label>👤 الموظف المسند:</label>
            <select id="filterEmployee">
                <option value="">الكل</option>
            </select>
            <button id="btnApplyFilters">🔍 تطبيق</button>
            <button id="btnResetFilters" class="reset">↺ إعادة تعيين</button>
        </div>
        <div id="consultationsContainer"><div class="loading">⏳ جاري التحميل...</div></div>
    </div>

    <!-- ====== قسم الإدخال اليدوي ====== -->
    <div id="sectionManualEntry" class="section">
        <h2>📝 إدخال طلب استشارة (يدوي)</h2>
        <div class="add-employee-form">
            <div class="form-row">
                <div class="form-group">
                    <label>اسم العميل *</label>
                    <input type="text" id="manualName" placeholder="الاسم الكامل">
                </div>
                <div class="form-group">
                    <label>رقم الهاتف *</label>
                    <input type="text" id="manualPhone" placeholder="01xxxxxxxxx">
                </div>
                <div class="form-group">
                    <label>البريد الإلكتروني</label>
                    <input type="email" id="manualEmail" placeholder="example@domain.com">
                </div>
                <div class="form-group">
                    <label>الشركة (اختياري)</label>
                    <input type="text" id="manualCompany" placeholder="اسم الشركة">
                </div>
                <div class="form-group">
                    <label>الخدمة المطلوبة</label>
                    <select id="manualService">
                        <option value="">اختر الخدمة</option>
                        <option value="corporate">استشارات الشركات</option>
                        <option value="contracts">صياغة العقود</option>
                        <option value="litigation">قضايا وتقاضي</option>
                        <option value="arbitration">تحكيم وتسوية نزاعات</option>
                        <option value="ip">حماية الملكية الفكرية</option>
                        <option value="other">استشارة عامة</option>
                    </select>
                </div>
            </div>
            <div class="form-row" style="margin-top: 10px;">
                <div class="form-group" style="flex: 2;">
                    <label>تفاصيل الطلب</label>
                    <textarea id="manualMessage" rows="4" style="width:100%; padding:8px; border:1px solid #dce1e8; border-radius:6px;" placeholder="اكتب ملخص الطلب هنا..."></textarea>
                </div>
                <div class="form-group" style="flex: 2;">
                    <label>📎 إرفاق ملف (صورة أو PDF - اختياري)</label>
                    <input type="file" id="manualAttachment" accept="image/*,.pdf" style="width: 100%; padding: 8px; border: 1px solid #dce1e8; border-radius: 6px;">
                </div>
            </div>
            <div class="form-group">
                <button id="btnAddManualConsultation" class="primary" style="margin-top: 10px;">➕ حفظ الطلب</button>
                <span id="manualMsg" class="staff-msg"></span>
            </div>
        </div>
    </div>

    <!-- ====== قسم إدارة الموظفين ====== -->
    <div id="sectionEmployees" class="section">
        <h2>👥 إدارة الموظفين</h2>
        <div class="add-employee-form" id="addEmployeeForm">
            <h3 style="margin-bottom:10px;">➕ إضافة موظف جديد</h3>
            <div class="form-row">
                <div class="form-group">
                    <label>الاسم الكامل</label>
                    <input type="text" id="empName" placeholder="اسم الموظف">
                </div>
                <div class="form-group">
                    <label>البريد الإلكتروني</label>
                    <input type="email" id="empEmail" placeholder="example@domain.com">
                </div>
                <div class="form-group">
                    <label>كلمة المرور المؤقتة</label>
                    <input type="text" id="empPassword" placeholder="كلمة مرور مؤقتة">
                </div>
                <div class="form-group">
                    <label>الدور</label>
                    <select id="empRole">
                        <option value="followup_staff">موظف متابعة</option>
                        <option value="manager">مدير</option>
                        <option value="secretary">سكرتير</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>الحالة</label>
                    <select id="empStatus">
                        <option value="true">نشط</option>
                        <option value="false">غير نشط</option>
                    </select>
                </div>
                <button id="btnAddEmployee">إضافة</button>
            </div>
        </div>
        <div id="employeesContainer"><div class="loading">⏳ جاري التحميل...</div></div>
    </div>
</div>

<!-- ====== نافذة المعاينة ====== -->
<div class="modal-overlay" id="previewModal">
    <div class="modal-content">
        <button class="modal-close" id="modalClose">✕</button>
        <div class="modal-title" id="modalTitle">تفاصيل الطلب</div>
        <div id="modalBody"><div class="loading">⏳ جاري التحميل...</div></div>
    </div>
</div>

<!-- ====== جافا سكريبت (تم فصله في ملف منفصل) ====== -->
<script src="dashboard.js"></script>

</body>
</html>
