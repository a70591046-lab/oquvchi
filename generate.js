const fs = require('fs');

const html = `<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>O'quvchi Kabineti - Minimalist LMS</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['Inter', 'sans-serif'] },
                    colors: {
                        slate: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a' },
                        indigo: { 50: '#eef2ff', 100: '#e0e7ff', 600: '#4f46e5' }
                    }
                }
            }
        }
    </script>
    <style>
        body { background-color: #F8FAFC; }
        .bento-card { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; box-shadow: 0 2px 10px -2px rgba(0, 0, 0, 0.02); transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .bento-card:hover { transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04); }
        .btn-primary { transition: all 0.2s ease; }
        .btn-primary:hover { opacity: 0.95; transform: scale(0.98); }
        .menu-item { transition: all 0.2s ease; }
        .menu-item:hover { background-color: #f1f5f9; color: #0f172a; }
        .menu-item.active { background-color: #f1f5f9; color: #0f172a; font-weight: 500; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .page-content { display: none; animation: fadeIn 0.3s ease-in-out; }
        .page-content.active { display: block; }
        .animation-fade-in { animation: fadeIn 0.3s ease-in-out; }
        .panel-hidden { display: none !important; }
        .panel-block { display: block !important; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        
        /* Mobile sidebar overlay */
        .sidebar-overlay { display: none; }
        .sidebar-overlay.active { display: block; }
        
        @media (max-width: 768px) {
            .mobile-sidebar-open { transform: translateX(0) !important; }
        }
    </style>
</head>
<body class="text-slate-900 font-sans antialiased bg-slate-50 overflow-hidden">

    <div id="toast-container" class="fixed bottom-5 right-5 flex flex-col gap-3 z-[100]"></div>

    <!-- AUTHENTICATION LAYOUT -->
    <div id="auth-layout" class="fixed inset-0 flex items-center justify-center z-50 bg-[#F8FAFC] overflow-y-auto p-4">
        <!-- Login Form -->
        <div id="form-login" class="bento-card p-6 md:p-10 w-full max-w-md animation-fade-in my-auto">
            <div class="flex flex-col items-center mb-8">
                <div class="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-sm mb-4">L</div>
                <h2 class="text-2xl font-semibold text-slate-900">Tizimga kirish</h2>
                <p class="text-slate-500 text-sm mt-1 text-center">Platformaga kirish uchun ma'lumotlaringizni kiriting</p>
            </div>
            <form onsubmit="login(event)" class="space-y-5">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">Email manzil</label>
                    <input type="email" id="log-email" required class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all text-slate-900 placeholder-slate-400 shadow-sm" placeholder="Sizning emailingiz">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">Parol</label>
                    <input type="password" id="log-pass" required class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all text-slate-900 placeholder-slate-400 shadow-sm" placeholder="••••••••">
                </div>
                <button type="submit" class="w-full py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm mt-2">Kirish</button>
            </form>
            <p class="text-center text-sm text-slate-500 mt-6">
                Hisobingiz yo'qmi? <a href="#" onclick="toggleAuth('register')" class="text-indigo-600 font-medium hover:underline">Ro'yxatdan o'tish</a>
            </p>
        </div>

        <!-- Register Form -->
        <div id="form-register" class="bento-card p-6 md:p-10 w-full max-w-md hidden animation-fade-in my-auto">
            <div class="flex flex-col items-center mb-8">
                <div class="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-sm mb-4">L</div>
                <h2 class="text-2xl font-semibold text-slate-900">Ro'yxatdan o'tish</h2>
                <p class="text-slate-500 text-sm mt-1 text-center">Yangi hisob yaratish</p>
            </div>
            <form onsubmit="register(event)" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1.5">Ism</label>
                        <input type="text" id="reg-fname" required class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-600 transition-all shadow-sm" placeholder="Ism">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1.5">Familiya</label>
                        <input type="text" id="reg-lname" required class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-600 transition-all shadow-sm" placeholder="Familiya">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">Email manzil</label>
                    <input type="email" id="reg-email" required class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-600 transition-all shadow-sm" placeholder="Emailingiz">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1.5">Parol</label>
                    <input type="password" id="reg-pass" required minlength="8" class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-600 transition-all shadow-sm" placeholder="Kamida 8 ta belgi">
                </div>
                <button type="submit" class="w-full py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm mt-4">Ro'yxatdan o'tish</button>
            </form>
            <p class="text-center text-sm text-slate-500 mt-6">
                Allaqachon hisobingiz bormi? <a href="#" onclick="toggleAuth('login')" class="text-indigo-600 font-medium hover:underline">Tizimga kirish</a>
            </p>
        </div>
    </div>

    <!-- DASHBOARD LAYOUT -->
    <div id="dashboard-layout" class="flex h-screen w-full hidden opacity-0 transition-opacity duration-300 relative">
        
        <!-- Mobile Sidebar Overlay -->
        <div id="mobile-overlay" onclick="toggleSidebar()" class="sidebar-overlay fixed inset-0 bg-slate-900/50 z-20 md:hidden"></div>

        <!-- Sidebar -->
        <aside id="sidebar" class="w-64 bg-white border-r border-slate-200 flex flex-col justify-between py-6 px-4 z-30 fixed md:relative h-full transition-transform duration-300 -translate-x-full md:translate-x-0">
            <div>
                <div class="flex items-center justify-between px-3 mb-10">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">L</div>
                        <span class="font-semibold text-lg tracking-tight">LearnSpace</span>
                    </div>
                    <button onclick="toggleSidebar()" class="md:hidden text-slate-500"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>
                
                <nav class="space-y-1">
                    <a href="#" data-target="page-home" class="menu-item active flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600">
                        <i data-lucide="layout-grid" class="w-5 h-5 text-slate-500"></i>
                        <span class="text-sm">Bosh sahifa</span>
                    </a>
                    <a href="#" data-target="page-courses" class="menu-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600">
                        <i data-lucide="book-open" class="w-5 h-5 text-slate-400"></i>
                        <span class="text-sm">Darslarim</span>
                    </a>
                    <!-- ADMIN MENU ITEM -->
                    <a href="#" id="menu-admin" data-target="page-admin" class="menu-item hidden items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 bg-amber-50/50 hover:bg-amber-50">
                        <i data-lucide="shield" class="w-5 h-5 text-amber-500"></i>
                        <span class="text-sm font-medium text-amber-700">Admin Panel</span>
                    </a>
                </nav>
            </div>
            
            <nav class="border-t border-slate-100 pt-4">
                <a href="#" data-target="page-settings" class="menu-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600">
                    <i data-lucide="settings" class="w-5 h-5 text-slate-400"></i>
                    <span class="text-sm">Sozlamalar</span>
                </a>
                <a href="#" onclick="logout()" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-2 text-sm font-medium">
                    <i data-lucide="log-out" class="w-5 h-5 text-red-500"></i>
                    <span class="text-sm">Chiqish</span>
                </a>
            </nav>
        </aside>

        <!-- Main Content Area -->
        <main class="flex-1 overflow-y-auto flex flex-col h-full w-full">
            
            <!-- Mobile Header -->
            <div class="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
                <div class="flex items-center gap-3">
                    <div class="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm text-sm">L</div>
                    <span class="font-semibold tracking-tight">LearnSpace</span>
                </div>
                <button onclick="toggleSidebar()" class="text-slate-600 p-1"><i data-lucide="menu" class="w-6 h-6"></i></button>
            </div>

            <div class="flex-1 p-4 md:p-8 w-full max-w-5xl mx-auto">
                
                <!-- HOME PAGE (Empty state instead of demo) -->
                <div id="page-home" class="page-content active">
                    <header class="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                        <div>
                            <h1 id="header-user-name" class="text-2xl font-semibold tracking-tight text-slate-900">Xush kelibsiz</h1>
                            <p class="text-slate-500 text-sm mt-1">Bugun o'rganishni davom ettiramizmi?</p>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-200 shadow-sm ml-auto md:ml-1 cursor-pointer">
                                <img id="header-avatar" src="" alt="Avatar" class="w-full h-full object-cover">
                            </div>
                        </div>
                    </header>

                    <div class="bento-card p-10 flex flex-col items-center justify-center text-center mt-10">
                        <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                            <i data-lucide="inbox" class="w-8 h-8"></i>
                        </div>
                        <h3 class="text-lg font-medium text-slate-900 mb-1">Hozircha ma'lumot yo'q</h3>
                        <p class="text-slate-500 text-sm max-w-sm">Sizda hozircha boshlangan darslar yoki vazifalar yo'q. Yangi darslarni "Darslarim" bo'limidan topishingiz mumkin.</p>
                        <button class="mt-6 px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                            Darslarni ko'rish
                        </button>
                    </div>
                </div>

                <!-- COURSES PAGE -->
                <div id="page-courses" class="page-content">
                    <header class="mb-8">
                        <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Mening Darslarim</h1>
                    </header>
                    <div class="bento-card p-10 flex flex-col items-center justify-center text-center">
                        <p class="text-slate-500 text-sm">Hozircha darslar mavjud emas.</p>
                    </div>
                </div>

                <!-- ADMIN PANEL -->
                <div id="page-admin" class="page-content">
                    <header class="mb-8">
                        <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Admin Panel (Barcha O'quvchilar)</h1>
                        <p class="text-slate-500 text-sm mt-1">Ro'yxatdan o'tgan barcha foydalanuvchilar va ularning parollari</p>
                    </header>
                    
                    <div class="bento-card overflow-x-auto w-full">
                        <table class="w-full text-sm text-left">
                            <thead class="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-100">
                                <tr>
                                    <th class="px-4 py-3 font-medium">ID</th>
                                    <th class="px-4 py-3 font-medium">O'quvchi</th>
                                    <th class="px-4 py-3 font-medium">Email</th>
                                    <th class="px-4 py-3 font-medium">Parol</th>
                                    <th class="px-4 py-3 font-medium text-right">Amal</th>
                                </tr>
                            </thead>
                            <tbody id="admin-users-table" class="divide-y divide-slate-50 whitespace-nowrap">
                                <!-- Users injected here via JS -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- SETTINGS PAGE -->
                <div id="page-settings" class="page-content">
                    <header class="mb-8">
                        <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Sozlamalar</h1>
                    </header>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                        <div class="col-span-1">
                            <div class="bento-card p-2 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible hide-scrollbar space-x-2 lg:space-x-0 lg:space-y-1">
                                <a href="#" data-setting-tab="panel-profile" class="settings-tab flex items-center gap-2 md:gap-3 px-3 py-2.5 bg-slate-50 rounded-lg text-slate-900 font-medium text-sm whitespace-nowrap">
                                    <i data-lucide="user" class="w-4 h-4 text-slate-500 shrink-0"></i> Profil
                                </a>
                                <a href="#" data-setting-tab="panel-security" class="settings-tab flex items-center gap-2 md:gap-3 px-3 py-2.5 text-slate-600 rounded-lg hover:bg-slate-50 text-sm whitespace-nowrap">
                                    <i data-lucide="lock" class="w-4 h-4 text-slate-400 shrink-0"></i> Parol
                                </a>
                            </div>
                        </div>
                        
                        <div class="col-span-1 lg:col-span-2 relative">
                            <!-- Profile -->
                            <div id="panel-profile" class="settings-panel panel-block bento-card p-5 md:p-8 animation-fade-in">
                                <h3 class="text-lg font-medium text-slate-900 mb-6">Asosiy ma'lumotlar</h3>
                                <div class="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mb-8">
                                    <div class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-200 overflow-hidden border border-slate-200 shrink-0">
                                        <img id="profile-avatar-preview" src="" alt="Avatar" class="w-full h-full object-cover">
                                    </div>
                                    <div>
                                        <input type="file" id="avatar-upload" class="hidden" accept="image/png, image/jpeg">
                                        <button onclick="document.getElementById('avatar-upload').click()" class="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 shadow-sm mb-2 w-full md:w-auto">Rasm yuklash</button>
                                        <p class="text-xs text-slate-500">JPG, PNG. Maks: 2MB.</p>
                                    </div>
                                </div>
                                <div class="space-y-4 md:space-y-5">
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                                        <div>
                                            <label class="block text-sm font-medium text-slate-700 mb-1.5">Ism</label>
                                            <input type="text" id="input-firstname" class="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-sm">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-slate-700 mb-1.5">Familiya</label>
                                            <input type="text" id="input-lastname" class="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-sm">
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-1.5">Email manzil</label>
                                        <input type="email" id="input-email" class="w-full px-3 md:px-4 py-2 md:py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed shadow-sm" readonly>
                                    </div>
                                </div>
                                <div class="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-slate-100 flex justify-end">
                                    <button onclick="saveProfile()" class="w-full md:w-auto px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 shadow-sm">Saqlash</button>
                                </div>
                            </div>

                            <!-- Security -->
                            <div id="panel-security" class="settings-panel panel-hidden bento-card p-5 md:p-8 animation-fade-in">
                                <h3 class="text-lg font-medium text-slate-900 mb-6">Xavfsizlik va parol</h3>
                                <div class="space-y-4 md:space-y-5">
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-1.5">Joriy parol</label>
                                        <input type="password" id="input-curr-pass" placeholder="••••••••" class="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-600 shadow-sm">
                                    </div>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 pt-2">
                                        <div>
                                            <label class="block text-sm font-medium text-slate-700 mb-1.5">Yangi parol</label>
                                            <input type="password" id="input-new-pass" placeholder="Min. 8 ta belgi" class="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-600 shadow-sm">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-slate-700 mb-1.5">Tasdiqlang</label>
                                            <input type="password" id="input-conf-pass" placeholder="Qayta kiriting" class="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-600 shadow-sm">
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-slate-100 flex justify-end">
                                    <button onclick="savePassword()" class="w-full md:w-auto px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 shadow-sm">Parolni yangilash</button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </main>
    </div>

    <!-- Scripts -->
    <script>
        lucide.createIcons();

        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('mobile-overlay');
            sidebar.classList.toggle('-translate-x-full');
            sidebar.classList.toggle('mobile-sidebar-open');
            overlay.classList.toggle('active');
        }

        function showToast(message, type = 'success') {
            const toastContainer = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = 'transform translate-y-10 opacity-0 transition-all duration-300 ease-out bg-white border border-slate-200 shadow-lg rounded-xl p-4 flex items-center gap-3 w-72 md:w-auto';
            const iconColor = type === 'success' ? 'text-emerald-500' : 'text-amber-500';
            const iconName = type === 'success' ? 'check-circle-2' : 'alert-circle';
            toast.innerHTML = \`<div class="shrink-0 mt-0.5"><i data-lucide="\${iconName}" class="w-5 h-5 \${iconColor}"></i></div><div><h4 class="text-sm font-medium text-slate-900">\${message}</h4></div>\`;
            toastContainer.appendChild(toast);
            lucide.createIcons({ root: toast }); 
            requestAnimationFrame(() => {
                toast.classList.remove('translate-y-10', 'opacity-0');
                toast.classList.add('translate-y-0', 'opacity-100');
            });
            setTimeout(() => {
                toast.classList.remove('translate-y-0', 'opacity-100');
                toast.classList.add('translate-y-2', 'opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        function toggleAuth(mode) {
            const login = document.getElementById('form-login');
            const register = document.getElementById('form-register');
            if(mode === 'login') {
                register.classList.add('hidden');
                login.classList.remove('hidden');
            } else {
                login.classList.add('hidden');
                register.classList.remove('hidden');
            }
        }

        function showAuth() {
            document.getElementById('dashboard-layout').classList.add('hidden');
            document.getElementById('auth-layout').classList.remove('hidden');
            toggleAuth('login');
        }

        function initApp() {
            const currentUserStr = localStorage.getItem('lms_current_user');
            if (currentUserStr) {
                const user = JSON.parse(currentUserStr);
                loadDashboard(user);
            } else {
                showAuth();
            }
        }

        function loadDashboard(user) {
            document.getElementById('auth-layout').classList.add('hidden');
            const dash = document.getElementById('dashboard-layout');
            dash.classList.remove('hidden');
            setTimeout(() => dash.classList.add('opacity-100'), 50);

            document.getElementById('header-user-name').textContent = \`Xush kelibsiz, \${user.firstName}\`;
            document.getElementById('input-firstname').value = user.firstName;
            document.getElementById('input-lastname').value = user.lastName;
            document.getElementById('input-email').value = user.email;
            
            const defaultAvatar = \`https://ui-avatars.com/api/?name=\${user.firstName}+\${user.lastName}&background=f1f5f9&color=0f172a&font-size=0.35\`;
            const avatarSrc = user.avatar || defaultAvatar;
            document.getElementById('header-avatar').src = avatarSrc;
            document.getElementById('profile-avatar-preview').src = avatarSrc;
            
            // Show Admin Panel if admin@admin.com
            if(user.email === 'admin@admin.com') {
                document.getElementById('menu-admin').classList.remove('hidden');
                document.getElementById('menu-admin').classList.add('flex');
            } else {
                document.getElementById('menu-admin').classList.add('hidden');
                document.getElementById('menu-admin').classList.remove('flex');
            }
        }

        async function register(e) {
            e.preventDefault();
            const fname = document.getElementById('reg-fname').value.trim();
            const lname = document.getElementById('reg-lname').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const pass = document.getElementById('reg-pass').value;
            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ firstName: fname, lastName: lname, email, password: pass })
                });
                const data = await res.json();
                if(!res.ok) {
                    showToast(data.error || 'Xatolik yuz berdi', 'error');
                    return;
                }
                data.password = pass; 
                localStorage.setItem('lms_current_user', JSON.stringify(data));
                showToast('Muvaffaqiyatli ro\\'yxatdan o\\'tdingiz!');
                loadDashboard(data);
            } catch (err) {
                showToast('Server bilan bog\\'lanishda xato', 'error');
            }
        }

        async function login(e) {
            e.preventDefault();
            const email = document.getElementById('log-email').value.trim();
            const pass = document.getElementById('log-pass').value;
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password: pass })
                });
                const data = await res.json();
                if(!res.ok) {
                    showToast(data.error || 'Email yoki parol noto\\'g\\'ri', 'error');
                    return;
                }
                localStorage.setItem('lms_current_user', JSON.stringify(data));
                loadDashboard(data);
                showToast('Tizimga muvaffaqiyatli kirdingiz!');
            } catch (err) {
                showToast('Server bilan bog\\'lanishda xato', 'error');
            }
        }

        function logout() {
            localStorage.removeItem('lms_current_user');
            document.getElementById('log-pass').value = '';
            document.querySelector('.menu-item[data-target="page-home"]').click();
            const dash = document.getElementById('dashboard-layout');
            dash.classList.remove('opacity-100');
            
            // Reset mobile sidebar state just in case
            document.getElementById('sidebar').classList.remove('mobile-sidebar-open');
            document.getElementById('mobile-overlay').classList.remove('active');
            
            setTimeout(() => {
                dash.classList.add('hidden');
                showAuth();
                showToast('Tizimdan chiqdingiz', 'success');
            }, 300);
        }

        async function updateUserInDB(updatedUser) {
            try {
                await fetch('/api/update-profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: updatedUser.email, firstName: updatedUser.firstName, lastName: updatedUser.lastName, avatar: updatedUser.avatar })
                });
            } catch (err) { console.error(err); }
        }

        // Avatar Upload
        const avatarUpload = document.getElementById('avatar-upload');
        if(avatarUpload) {
            avatarUpload.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if(file) {
                    if(file.size > 2 * 1024 * 1024) {
                        showToast('Rasm hajmi 2MB dan katta bo\\'lmasligi kerak', 'error');
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = function(evt) {
                        const base64 = evt.target.result;
                        document.getElementById('profile-avatar-preview').src = base64;
                        document.getElementById('header-avatar').src = base64;
                        let user = JSON.parse(localStorage.getItem('lms_current_user'));
                        user.avatar = base64;
                        localStorage.setItem('lms_current_user', JSON.stringify(user));
                        updateUserInDB(user);
                        showToast('Profil rasmi muvaffaqiyatli yuklandi!');
                    }
                    reader.readAsDataURL(file);
                }
            });
        }

        async function saveProfile() {
            const firstName = document.getElementById('input-firstname').value.trim();
            const lastName = document.getElementById('input-lastname').value.trim();
            if(!firstName || !lastName) {
                showToast('Ism va familiya bo\\'sh bo\\'lishi mumkin emas', 'error');
                return;
            }
            let user = JSON.parse(localStorage.getItem('lms_current_user'));
            user.firstName = firstName;
            user.lastName = lastName;
            localStorage.setItem('lms_current_user', JSON.stringify(user));
            updateUserInDB(user);
            document.getElementById('header-user-name').textContent = \`Xush kelibsiz, \${firstName}\`;
            if(!user.avatar) {
                const defaultAvatar = \`https://ui-avatars.com/api/?name=\${firstName}+\${lastName}&background=f1f5f9&color=0f172a&font-size=0.35\`;
                document.getElementById('header-avatar').src = defaultAvatar;
                document.getElementById('profile-avatar-preview').src = defaultAvatar;
            }
            showToast('Profil muvaffaqiyatli saqlandi!');
        }

        async function savePassword() {
            const curr = document.getElementById('input-curr-pass').value;
            const newP = document.getElementById('input-new-pass').value;
            const conf = document.getElementById('input-conf-pass').value;
            if(!curr || !newP || !conf) { showToast('Iltimos, barcha maydonlarni to\\'ldiring', 'error'); return; }
            if(newP !== conf) { showToast('Yangi parollar mos kelmadi', 'error'); return; }
            if(newP.length < 8) { showToast('Kamida 8 ta belgi kiriting', 'error'); return; }
            let user = JSON.parse(localStorage.getItem('lms_current_user'));
            try {
                const res = await fetch('/api/update-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email, currentPassword: curr, newPassword: newP })
                });
                const data = await res.json();
                if(!res.ok) { showToast(data.error || 'Joriy parol noto\\'g\\'ri!', 'error'); return; }
                user.password = newP;
                localStorage.setItem('lms_current_user', JSON.stringify(user));
                showToast('Parol muvaffaqiyatli yangilandi!');
                document.getElementById('input-curr-pass').value = '';
                document.getElementById('input-new-pass').value = '';
                document.getElementById('input-conf-pass').value = '';
            } catch (err) { showToast('Server xatosi', 'error'); }
        }

        // Navigation
        const menuItems = document.querySelectorAll('.menu-item[data-target]');
        const pages = document.querySelectorAll('.page-content');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = item.getAttribute('data-target');
                if(!targetId) return;
                
                // Hide mobile sidebar on click
                document.getElementById('sidebar').classList.remove('mobile-sidebar-open');
                document.getElementById('mobile-overlay').classList.remove('active');

                menuItems.forEach(link => {
                    link.classList.remove('active', 'font-medium', 'text-slate-900', 'bg-slate-100');
                    if(link.id !== 'menu-admin') link.classList.add('text-slate-600');
                    const icon = link.querySelector('i');
                    if(icon && link.id !== 'menu-admin') { icon.classList.remove('text-slate-500'); icon.classList.add('text-slate-400'); }
                });

                item.classList.add('active', 'font-medium', 'text-slate-900', 'bg-slate-100');
                if(item.id !== 'menu-admin') item.classList.remove('text-slate-600');
                const activeIcon = item.querySelector('i');
                if(activeIcon && item.id !== 'menu-admin') { activeIcon.classList.remove('text-slate-400'); activeIcon.classList.add('text-slate-500'); }

                pages.forEach(page => page.classList.remove('active'));
                const targetPage = document.getElementById(targetId);
                if(targetPage) targetPage.classList.add('active');
                
                if(targetId === 'page-admin') loadAdminUsers();
            });
        });

        const settingsTabs = document.querySelectorAll('.settings-tab[data-setting-tab]');
        const settingsPanels = document.querySelectorAll('.settings-panel');
        settingsTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = tab.getAttribute('data-setting-tab');
                if(!targetId) return;
                settingsTabs.forEach(t => {
                    t.classList.remove('bg-slate-50', 'text-slate-900', 'font-medium');
                    t.classList.add('text-slate-600');
                });
                tab.classList.add('bg-slate-50', 'text-slate-900', 'font-medium');
                tab.classList.remove('text-slate-600');
                settingsPanels.forEach(panel => {
                    panel.classList.remove('panel-block');
                    panel.classList.add('panel-hidden');
                });
                const targetPanel = document.getElementById(targetId);
                if(targetPanel) {
                    targetPanel.classList.remove('panel-hidden');
                    targetPanel.classList.add('panel-block');
                }
            });
        });

        // Admin API calls
        async function loadAdminUsers() {
            const table = document.getElementById('admin-users-table');
            table.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-500">Yuklanmoqda...</td></tr>';
            try {
                const res = await fetch('/api/users');
                const users = await res.json();
                
                if(users.length === 0) {
                    table.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-500">Hozircha o\\'quvchilar yo\\'q</td></tr>';
                    return;
                }
                
                table.innerHTML = '';
                users.forEach(u => {
                    const defaultAvatar = \`https://ui-avatars.com/api/?name=\${u.firstName}+\${u.lastName}&background=f1f5f9&color=0f172a&font-size=0.35\`;
                    const tr = document.createElement('tr');
                    tr.className = 'hover:bg-slate-50/50 transition-colors group';
                    tr.innerHTML = \`
                        <td class="px-4 py-3 text-slate-500">#\${u.id}</td>
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                                    <img src="\${defaultAvatar}" alt="Avatar" class="w-full h-full object-cover">
                                </div>
                                <span class="font-medium text-slate-900">\${u.firstName} \${u.lastName}</span>
                            </div>
                        </td>
                        <td class="px-4 py-3 text-slate-600">\${u.email}</td>
                        <td class="px-4 py-3 text-slate-500 font-mono text-xs">\${u.password}</td>
                        <td class="px-4 py-3 text-right">
                            <button onclick="deleteUser(\${u.id})" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="O'chirish">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </td>
                    \`;
                    table.appendChild(tr);
                });
                lucide.createIcons({ root: table });
            } catch (err) {
                table.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-red-500">Xatolik: ' + err.message + '</td></tr>';
            }
        }

        async function deleteUser(id) {
            if(!confirm('Bu o\\'quvchini o\\'chirmoqchimisiz?')) return;
            try {
                const res = await fetch('/api/delete-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id })
                });
                if(res.ok) {
                    showToast('O\\'quvchi o\\'chirildi');
                    loadAdminUsers();
                } else {
                    showToast('Xatolik yuz berdi', 'error');
                }
            } catch(e) {
                showToast('Server xatosi', 'error');
            }
        }

        initApp();
    </script>
</body>
</html>`;

fs.writeFileSync('public/index.html', html);
console.log('index.html muvaffaqiyatli yangilandi');
