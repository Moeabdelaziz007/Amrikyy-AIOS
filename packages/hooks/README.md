# @auraos/hooks

React Hooks مشتركة لإدارة الحالة في AuraOS.

## التثبيت

```bash
pnpm add @auraos/hooks
```

## الـ Hooks المتاحة

### 🤖 useAI
للتفاعل مع خدمات الذكاء الاصطناعي:

```typescript
import { useAI } from '@auraos/hooks';

function ChatComponent() {
  const { chat, chatStream, loading, error } = useAI();

  const handleChat = async () => {
    const response = await chat([
      { role: 'user', content: 'مرحباً' }
    ]);
    console.log(response.content);
  };

  const handleStream = async () => {
    await chatStream(
      [{ role: 'user', content: 'اكتب قصة' }],
      (chunk) => {
        if (!chunk.done) {
          console.log(chunk.content);
        }
      }
    );
  };

  return (
    <div>
      {loading && <p>جاري التحميل...</p>}
      {error && <p>خطأ: {error}</p>}
      <button onClick={handleChat}>محادثة</button>
      <button onClick={handleStream}>محادثة مباشرة</button>
    </div>
  );
}
```

### 🔧 useMCP
للتفاعل مع MCP Tools:

```typescript
import { useMCP } from '@auraos/hooks';

function FileManager() {
  const { file, emulator, ai, loading, error, initialized } = useMCP();

  const handleReadFile = async () => {
    const content = await file.read('/path/to/file.txt');
    console.log(content);
  };

  const handleGenerateCode = async () => {
    const result = await emulator.execute('اطبع مرحبا 10 مرات');
    console.log('الكود:', result.code);
    console.log('النتيجة:', result.output);
    console.log('الشرح:', result.explanation);
  };

  const handleAnalyzeCode = async (code: string) => {
    const analysis = await ai.analyzeCode(code, 'BASIC');
    console.log(analysis);
  };

  if (!initialized) {
    return <p>جاري التهيئة...</p>;
  }

  return (
    <div>
      {loading && <p>جاري التنفيذ...</p>}
      {error && <p>خطأ: {error}</p>}
      <button onClick={handleReadFile}>قراءة ملف</button>
      <button onClick={handleGenerateCode}>توليد كود</button>
    </div>
  );
}
```

### 👤 useUserProfile
لإدارة ملف المستخدم:

```typescript
import { useUserProfile } from '@auraos/hooks';

function ProfileSettings() {
  const { profile, loading, error, updatePreferences, updateProfile } = useUserProfile();

  const handleUpdateTheme = async () => {
    await updatePreferences({
      theme: 'dark',
    });
  };

  if (loading) return <p>جاري التحميل...</p>;
  if (error) return <p>خطأ: {error}</p>;
  if (!profile) return <p>لم يتم العثور على الملف الشخصي</p>;

  return (
    <div>
      <h2>مرحباً {profile.displayName}</h2>
      <p>البريد: {profile.email}</p>
      <p>المظهر: {profile.preferences.theme}</p>
      <button onClick={handleUpdateTheme}>تغيير المظهر</button>
    </div>
  );
}
```

### 🧠 useLearningLoop
لتتبع سلوك المستخدم والحصول على رؤى:

```typescript
import { useLearningLoop } from '@auraos/hooks';

function Dashboard() {
  const {
    insights,
    patterns,
    sessions,
    loading,
    initialized,
    trackAppLaunch,
    trackCommand,
    acknowledgeInsight,
    refresh,
  } = useLearningLoop();

  const handleAppLaunch = async (appId: string, appName: string) => {
    await trackAppLaunch(appId, appName);
  };

  const handleCommand = async (command: string, success: boolean) => {
    await trackCommand(command, success);
  };

  if (!initialized) return <p>جاري التهيئة...</p>;
  if (loading) return <p>جاري التحميل...</p>;

  return (
    <div>
      <h2>الرؤى ({insights.length})</h2>
      {insights.map(insight => (
        <div key={insight.id}>
          <h3>{insight.title}</h3>
          <p>{insight.description}</p>
          <button onClick={() => acknowledgeInsight(insight.id)}>
            تم الاطلاع
          </button>
        </div>
      ))}

      <h2>الأنماط ({patterns.length})</h2>
      {patterns.map(pattern => (
        <div key={pattern.id}>
          <h3>{pattern.name}</h3>
          <p>{pattern.description}</p>
          <p>التكرار: {pattern.frequency}</p>
          <p>الثقة: {Math.round(pattern.confidence * 100)}%</p>
        </div>
      ))}

      <button onClick={refresh}>تحديث</button>
    </div>
  );
}
```

## الميزات

### ✅ TypeScript Support
جميع الـ Hooks مكتوبة بـ TypeScript مع types كاملة.

### ✅ Error Handling
معالجة تلقائية للأخطاء مع رسائل واضحة.

### ✅ Loading States
حالات تحميل تلقائية لجميع العمليات غير المتزامنة.

### ✅ Auto Initialization
تهيئة تلقائية للخدمات عند الحاجة.

### ✅ Cleanup
تنظيف تلقائي عند إلغاء تحميل المكون.

## المتطلبات

- React 18.2+
- @auraos/core
- @auraos/firebase
- @auraos/ui (للـ AuthContext)

## الترخيص

MIT
