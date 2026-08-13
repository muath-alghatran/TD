# نقل Trust Drive إلى Claude Code — ويندوز
### دليل تنفيذي · انسخ والصق

---

## المبدأ الحاكم

> **لا ترمِ الملفات في مجلد وتقول «ابنِ الموقع».**
> الطريقة الصحيحة: بنية منظّمة + ملف فهرس + `CLAUDE.md` + **جلسة أولى للفهم لا للبناء**.

الفرق بين المشروعين ليس في الملفات — بل في أن Claude Code يعرف **ماذا يقرأ، وبأي ترتيب، وما القواعد التي لا يكسرها**.

---

## الخطوة 1 · تجهيز ويندوز *(١٠ دقائق)*

افتح **PowerShell** — لا CMD. (الفرق مصدر أغلب أخطاء البداية.)

```powershell
# تحقق من Claude Code
claude --version
claude doctor          # التشخيص — شغّله عند أي مشكلة

# ثبّت Git for Windows إن لم يكن موجوداً (مطلوب لأداة Bash)
winget install --id Git.Git -e

# ثبّت Node.js (مطلوب لـ Next.js)
winget install --id OpenJS.NodeJS.LTS -e
```

**إن ظهر `claude is not recognized`:** أضف `%USERPROFILE%\.local\bin` إلى متغير PATH، ثم **أغلق PowerShell وافتحه من جديد**.

### إعدادان لا يُغفلان — العربية

```powershell
# يمنع تشويه النص العربي في الطرفية
chcp 65001
$OutputEncoding = [System.Text.Encoding]::UTF8
```

**لجعله دائماً:** أضف السطرين إلى ملف `$PROFILE` في PowerShell.

---

## الخطوة 2 · إنشاء المشروع

```powershell
# مسار قصير بلا مسافات ولا عربي — مهم
mkdir C:\dev\trustdrive
cd C:\dev\trustdrive

npx create-next-app@latest . --typescript --tailwind --app --src-dir --eslint

git init
git config core.autocrlf true       # يمنع فوضى نهايات الأسطر على ويندوز

mkdir docs, docs\data, .claude, .claude\agents
```

> **لا تضع المشروع في `Documents` أو `OneDrive` أو `سطح المكتب`.**
> المسافات والعربية والمزامنة السحابية تسبب أخطاء يصعب تشخيصها. `C:\dev\` أسلم.

---

## الخطوة 3 · نقل الملفات وإعادة تسميتها

انسخ الملفات إلى `C:\dev\trustdrive\docs\` **بأسماء إنجليزية قصيرة** — الأسماء الطويلة تُربك الإشارة إليها في المحادثة:

| الملف الأصلي | الاسم الجديد في `docs\` |
|---|---|
| `00_START_HERE.md` | `00_START_HERE.md` ← **في الجذر لا في docs** |
| `TrustDrive_Prototype.html` | `prototype-parts.html` |
| `TrustDrive_App_Home.html` | `prototype-app.html` |
| `TrustDrive_Homepage.html` | `prototype-landing.html` |
| `TrustDrive_Dev_Brief.md` | `brief.md` |
| `TrustDrive_Build_Plan.md` | `build-plan.md` |
| `TrustDrive_Auth_Spec.md` | `auth-spec.md` |
| `TrustDrive_Payment_Spec.md` | `payment-spec.md` |
| `TrustDrive_Concept_Spec.md` | `concept.md` |
| `TrustDrive_Parts_Master.xlsx` | `parts-master.xlsx` |
| ملفات `csv\*.csv` | `docs\data\*.csv` |

**البنية النهائية:**

```
C:\dev\trustdrive\
├── CLAUDE.md                    ← الخطوة 4
├── 00_START_HERE.md             ← الفهرس
├── .claude\
│   ├── settings.json
│   └── agents\
│       ├── design-auditor.md
│       └── promise-tester.md
├── docs\
│   ├── prototype-parts.html     ★ المرجع الملزم
│   ├── prototype-app.html
│   ├── prototype-landing.html
│   ├── brief.md
│   ├── build-plan.md
│   ├── auth-spec.md
│   ├── payment-spec.md
│   ├── concept.md
│   ├── parts-master.xlsx
│   └── data\
│       ├── settings.csv
│       ├── parts_catalog.csv
│       ├── suppliers.csv
│       ├── inventory_pricing.csv
│       ├── cities_sla.csv
│       ├── labor_rates.csv
│       ├── zone_map.csv
│       └── demand_gap.csv
└── src\ ...
```

> **لماذا CSV مع الإكسل؟** Claude Code يقرأ النصوص مباشرة، أما الإكسل فيحتاج سكربتاً في كل مرة. ملفات CSV جاهزة معك — استخدمها للبذر، وأبقِ الإكسل مرجعاً للمعادلات.

---

## الخطوة 4 · `CLAUDE.md` — أهم ملف في الإعداد

أنشئه في **جذر المشروع**. يُقرأ تلقائياً في كل جلسة، فيوفّر عليك إعادة الشرح ويمنع الانحراف.

```markdown
# Trust Drive — سياق المشروع

منصة قطع غيار سعودية. الفكرة الجوهرية: لا نعرض "متوفر/غير متوفر" —
نعرض وعداً محسوباً بالثقة (أيام + نسبة) بثلاث حالات لونية.

## اقرأ أولاً
`00_START_HERE.md` في الجذر — فيه ترتيب القراءة والملخص التنفيذي.

## المراجع
- `docs/prototype-parts.html` — المرجع البصري والسلوكي. الحقيقة النهائية.
- `docs/prototype-app.html` — هيكل التطبيق والتبويبات
- `docs/brief.md` — المواصفات ونظام التصميم
- `docs/build-plan.md` — المراحل والبوابات
- `docs/auth-spec.md` · `docs/payment-spec.md`
- `docs/data/*.csv` — بيانات البذر

## قواعد لا تُكسر
1. اللون المشبع = حالة التوفر فقط. لا أزرار ملونة، لا تدرجات، لا لون علامة.
2. الخطوط: Alexandria (عناوين) · IBM Plex Sans Arabic (نص) · IBM Plex Mono (أرقام).
3. الأرقام: بيانات الآلة لاتيني أحادي المسافة · سرد الإنسان عربي-هندي.
4. كل العتبات من جدول Setting في قاعدة البيانات — لا في الكود.
5. RTL أساسي · العربية اللغة الأولى.
6. prefers-reduced-motion يوقف كل حركة.
7. Fitment يربط بـ generationCode (XV70) لا بالسنة.
8. كل بحث فاشل وكل "أبلغني عند التوفر" يُسجَّل في DemandGap — من اليوم الأول.
9. سيارات المستخدم المحفوظة تُسمى "كراجي" بالكاف.

## قواعد الدفع
10. لا حجز مبالغ (Authorization) إطلاقاً.
11. أخضر → دفع فوري. أصفر ورمادي → بلا دفع حتى تأكيد الإدارة، ثم رابط دفع 12 ساعة.
12. كل طرق الدفع متاحة في كل الحالات — المتغير هو التوقيت لا القائمة.
13. عدّاد الوعد يبدأ من paidAt لا من requestedAt. حرج.
14. التأكيد إجراء بشري من لوحة التحكم — لا تأكيد آلي.
15. السعر يُثبَّت عند التأكيد ولا يتغير بعده.
16. لا شراء من المورد قبل دفع العميل.
17. الكاش لا يظهر مع خيار التوصيل.
18. السعر يُعاد التحقق منه في الخادم قبل الدفع.
19. تأكيد الدفع من Webhook موقّع فقط، لا من المتصفح.
20. مفتاح تفرّد إلزامي لكل عملية دفع.

## الأوامر
npm run dev · npm run build · npm test · npx prisma studio

## أسلوب العمل
- خطة أولاً ثم تنفيذ. توقف بعد كل مرحلة للمراجعة.
- اختبارات محرك الوعد تُكتب قبل الكود.
- لا تخترع ألواناً أو خطوطاً — استخرجها من النموذج.
- عند الشك في مظهر شيء: افتح docs/prototype-parts.html واقرأه.
- تحدث معي بالعربية.
```

---

## الخطوة 5 · الإعدادات والوكلاء

**`.claude\settings.json`** — الـ hook هنا صمام الأمان: الاختبارات تعمل قبل كل توقف.

```json
{
  "permissions": {
    "allow": ["Bash(npm run:*)","Bash(npm test:*)","Bash(npx prisma:*)","Bash(git status)","Bash(git diff:*)"],
    "deny": ["Bash(rm -rf:*)","Read(./.env)","Read(./.env.*)"]
  },
  "hooks": {
    "Stop": [{ "hooks": [{ "type": "command", "command": "npm test --silent 2>&1 | tail -20" }] }]
  }
}
```

الوكيلان `design-auditor.md` و `promise-tester.md` — نصّهما في ملف `TrustDrive_ClaudeCode_Setup.md`.

```powershell
git add .
git commit -m "إعداد المشروع والمراجع"
```

**احفظ الآن قبل أي بناء.** هذه نقطة تراجعك الآمنة.

---

## الخطوة 6 · الجلسة الأولى — للفهم لا للبناء

```powershell
cd C:\dev\trustdrive
claude
```

**أول أمر — انسخه حرفياً:**

```
اقرأ 00_START_HERE.md ثم اتبع ترتيب القراءة فيه بالكامل.

افتح docs/prototype-parts.html واقرأه كاملاً — CSS و JS معاً.
ثم اقرأ brief.md و build-plan.md و payment-spec.md و auth-spec.md.
ثم افحص docs/data/*.csv.

لا تكتب أي كود.

لخّص لي بالعربية:
1. محرك الوعد — المعادلة والحالات الثلاث
2. بنية البيانات الأساسية
3. المرحلة الأولى وبوابة فحصها
4. أي تعارض وجدته بين المستندات

ثم قف وانتظر موافقتي.
```

**هذه الجلسة أهم من عشر جلسات بناء.** إن كان الملخص دقيقاً، فقد فهم المشروع. وإن كان ناقصاً، صحّحه **الآن** — لا بعد ثلاثة آلاف سطر.

---

## الخطوة 7 · البناء بالمراحل

```
[Shift+Tab] للدخول في Plan Mode

اقرأ المرحلة 1 في docs/build-plan.md وضع خطة تنفيذ مفصّلة.
لا تنفّذ حتى أوافق.
```

بعد كل مرحلة:

```powershell
npm run dev          # افحص بنفسك في المتصفح
git add . ; git commit -m "المرحلة 1 — نظام التصميم"
```

ثم في Claude Code:
```
/clear
```
**جلسة نظيفة لكل مرحلة.** السياق الطويل يُضعف الدقة تدريجياً.

---

## أخطاء ويندوز الشائعة

| العَرَض | الحل |
|---|---|
| `claude is not recognized` | أضف `%USERPROFILE%\.local\bin` للـ PATH ثم أعد فتح PowerShell |
| `&&` مرفوض | أنت في CMD لا PowerShell — استخدم `;` أو افتح PowerShell |
| عربي مشوّه في الطرفية | `chcp 65001` وأضفها إلى `$PROFILE` |
| نهايات أسطر فوضوية في Git | `git config core.autocrlf true` |
| أخطاء مسار غامضة | المشروع في مجلد فيه مسافات أو عربي — انقله إلى `C:\dev\` |
| أي مشكلة أخرى | `claude doctor` أولاً — قبل البحث في المنتديات |

---

## قائمة تحقق قبل أول أمر

- [ ] `claude --version` يعمل
- [ ] `claude doctor` بلا أخطاء
- [ ] المشروع في `C:\dev\trustdrive`
- [ ] `git init` تم و`autocrlf` مضبوط
- [ ] `CLAUDE.md` و `00_START_HERE.md` في الجذر
- [ ] الملفات التسعة في `docs\` بأسمائها الجديدة
- [ ] ملفات CSV الثمانية في `docs\data\`
- [ ] `.claude\settings.json` والوكيلان
- [ ] `chcp 65001` مضبوط
- [ ] أول commit تم

---

## أخطر ثلاثة أخطاء في النقل

**١. أن تطلب البناء في أول أمر.**
اجعل الجلسة الأولى للفهم. الملخص الذي يعيده لك يكشف سوء الفهم قبل أن يتحول إلى آلاف الأسطر.

**٢. أن تتجاوز بوابة فحص.**
Claude Code سريع لدرجة أنك تبني سبع مراحل في يومين. الخلل يظهر بعد الإطلاق حين يكون إصلاحه أغلى عشر مرات.

**٣. أن تشرح بالكلام بدل الإشارة إلى النموذج.**
حين ينحرف بصرياً، قل: *«افتح `docs/prototype-parts.html` وقارن الألوان والمسافات»* — لا تصف الفرق بالكلمات.
