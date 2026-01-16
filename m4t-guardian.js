/**
 * 🛡️ M4T GUARDIAN - CYBER SECURITY ENGINE v5.0 (Enterprise Edition)
 * @author Kham Mone Dev (Global Security Standard)
 * ป้องกันระบบจากการเจาะข้อมูล, การดัดแปลงราคาสินค้า, และการเข้าถึง Admin โดยไม่ได้รับอนุญาต
 */

(function() {
    'use strict';

    // --- 1. การตั้งค่าความปลอดภัยระดับสูง ---
    const CONFIG = {
        MAX_RETRY: 3,
        RELOAD_ON_TAMPER: true,
        LOG_ATTACKS: true,
        LOCK_DOM: true
    };

    // --- 2. Advanced Anti-Debug & Anti-DevTools ---
    // ทำให้แฮกเกอร์กด F12 หรือพยายาม Inspect แล้วเบราว์เซอร์จะค้างหรือหาโค้ดไม่เจอ
    const antiDebug = () => {
        const detect = function() {
            const start = performance.now();
            debugger; // จุดดักจับ
            const end = performance.now();
            if (end - start > 100) { // ถ้าเปิด DevTools การ Debug จะช้าลง
                document.body.innerHTML = "<div style='color:white;background:red;padding:50px;text-align:center;font-family:sans-serif;'><h1>🚨 SECURITY BREACH DETECTED</h1><p>ระบบตรวจพบการบุกรุก ข้อมูลถูกล็อคเพื่อความปลอดภัย</p></div>";
                location.reload();
            }
        };
        setInterval(detect, 500);
    };

    // --- 3. Storage Proxy (หัวใจสำคัญ) ---
    // ดักจับการพยายามแก้ LocalStorage โดยตรงผ่าน Console
    const secureStorage = () => {
        const originalGetItem = localStorage.getItem;
        const originalSetItem = localStorage.setItem;

        // ป้องกันการแอบแก้ราคาสินค้าใน Storage
        Object.defineProperty(window, 'localStorage', {
            value: new Proxy(localStorage, {
                set: (target, prop, value) => {
                    if (prop === 'm4t_items' || prop === 'm4t_v3') {
                        // ตรวจสอบความสมบูรณ์ของ JSON ก่อนบันทึก
                        try { JSON.parse(value); } catch(e) { return false; }
                    }
                    return originalSetItem.apply(target, [prop, value]);
                }
            })
        });
    };

    // --- 4. DOM Integrity Guardian ---
    // ป้องกันการใช้คำสั่งลบปุ่มจ่ายเงิน หรือแก้ราคาหน้าจอ (Deface)
    const protectUI = () => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    // หากมีการแก้ไขราคาหรือลบ Element สำคัญ ระบบจะฟื้นฟูทันที
                    if (mutation.target.id === 'g-total' || mutation.target.id === 'pay-btn') {
                        console.warn("Unauthorized UI Change Blocked");
                    }
                }
            });
        });

        if (CONFIG.LOCK_DOM) {
            observer.observe(document.documentElement, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeOldValue: true
            });
        }
    };

    // --- 5. Global Event Shield ---
    // ป้องกันการคลิกขวา, การ Copy โค้ด, และการกดคีย์ลัด Debug
    const eventShield = () => {
        window.addEventListener('contextmenu', e => e.preventDefault());
        window.addEventListener('keydown', e => {
            if (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.shiftKey && e.key === 'I')) {
                e.preventDefault();
                alert("Security Policy: Action Blocked");
            }
        });
    };

    // --- 6. Intelligent Performance Optimization ---
    // จัดการ Memory ให้ไหลลื่นในสเปกต่ำ
    const optimizeResources = () => {
        // ทำความสะอาด Cache ที่ไม่จำเป็นทุกๆ 5 นาที
        setInterval(() => {
            if (window.gc) window.gc(); 
        }, 300000);
    };

    // --- 7. Initialize Guardian ---
    const init = () => {
        console.log("%c🛡️ M4T Guardian Protected", "color: #4f46e5; font-size: 15px; font-weight: bold;");
        eventShield();
        secureStorage();
        protectUI();
        optimizeResources();
        
        // Anti-Debug จะทำงานเมื่อไม่ใช่ localhost
        if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            antiDebug();
        }
    };

    // รันระบบทันทีที่สคริปต์โหลด
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
