import { createContext, useContext } from 'react';

export const translations = {
  zh: {
    nav: { features: '功能', community: '社区', pricing: '方案', login: '登录', register: '注册', getStarted: '开始使用' },
    hero: { eyebrow: '你的宠物，值得最好的', title1: '智能宠物', title2: '生活伴侣', sub: '健康档案、社区交流、AI 智能分析——一站式守护毛孩子的每一天。', cta: '免费注册', ctaSec: '了解更多' },
    features: { label: '核心功能', title: '为什么选择 BestiePaw', health: '健康档案', healthDesc: '疫苗接种、体检报告、用药计划，自动提醒复诊，完整健康档案随时导出。', social: '宠物社区', socialDesc: '同城宠物主互动，分享养宠日记和经验，发布走失/领养信息。', ai: 'AI 分析', aiDesc: '上传照片识别品种年龄，描述症状获取初步分析，7×24h 在线答疑。' },
    how: { label: '使用流程', title: '三步开始', s1: '创建账号', s1d: '30秒完成注册', s2: '登记宠物', s2d: '上传照片填写档案', s3: '畅享功能', s3d: '解锁全部功能' },
    cta: { title: '开始守护你的毛孩子', sub: '核心功能永久免费，立即加入。', btn: '立即注册' },
    footer: { copy: '© 2026 BestiePaw. 让每只毛孩子都被好好爱着。', privacy: '隐私政策', terms: '服务条款' },
    auth: { loginTitle: '欢迎回来', loginSub: '登录继续照顾你的毛孩子', email: '邮箱', password: '密码', confirmPwd: '确认密码', username: '昵称', phone: '手机号（选填）', forgot: '忘记密码？', loginBtn: '登录', registerTitle: '创建账号', registerSub: '加入 BestiePaw，为毛孩子建立专属档案', registerBtn: '注册并继续', noAccount: '没有账号？', hasAccount: '已有账号？', agree: '我已阅读并同意', terms: '服务条款', and: '与', privacy: '隐私政策', step1: '创建账号', step2: '宠物信息', step3: '完成', socialApple: 'Apple 登录', socialGoogle: 'Google 登录', orEmail: '或使用邮箱', pwdStrength: ['太弱', '较弱', '一般', '强'], showPwd: '显示', hidePwd: '隐藏' },
    pet: { title: '告诉我们关于你的宠物', sub: '填写越详细，健康建议越精准。', tip: '信息可以随时修改，现在填写基础信息即可。', name: '宠物名字', nameP: '它叫什么名字？', type: '宠物类型', breed: '品种', breedP: '如：金毛寻回猎犬', birthday: '出生日期（约）', gender: '性别', male: '公', female: '母', unknown: '未知', weight: '体重（kg）', neutered: '是否已绝育', allergies: '已知过敏/疾病史', note: '补充备注', save: '保存并继续', skip: '暂时跳过', photo: '上传宠物照片（可选）', dog: '狗', cat: '猫', rabbit: '兔子', bird: '鸟类', fish: '鱼类', other: '其他', yes: '是', no: '否', unsure: '不确定', select: '请选择' },
    complete: { title: '注册成功！', sub: '宠物档案已建立，去探索所有功能吧。', btn: '进入首页' },
    dash: { overview: '概览', health: '健康管理', community: '社区', ai: 'AI 助手', reminders: '提醒', profile: '个人中心', myPets: '我的宠物', addPet: '添加宠物', hello: '你好', noPets: '还没有宠物档案', noPetsDesc: '点击上方按钮添加你的第一只毛孩子', upcoming: '即将到来', healthTimeline: '健康时间线', quickActions: '快捷操作', addRecord: '新增记录', setReminder: '设置提醒', viewAll: '查看全部', logout: '退出登录' },
    healthPage: { title: '健康管理', addRecord: '新增记录', noRecords: '暂无记录', vaccine: '疫苗', checkup: '体检', medication: '用药', surgery: '手术', type: '类型', date: '日期', description: '描述', titleField: '标题', save: '保存', cancel: '取消', all: '全部' },
    communityPage: { title: '宠物社区', write: '发动态', placeholder: '分享你和毛孩子的故事...', post: '发布', likes: '赞', comments: '评论' },
    aiPage: { title: 'AI 智能助手', placeholder: '描述宠物的症状或问题...', send: '发送', welcome: '你好！我是 BestiePaw AI 助手，可以帮你分析宠物的健康问题。请描述你的问题，我会给出初步建议。', disclaimer: 'AI 建议仅供参考，如有紧急情况请立即就医。' },
    profilePage: { title: '个人设置', basic: '基本信息', save: '保存修改', langLabel: '语言 / Language', dangerZone: '危险操作', deleteAccount: '注销账号' },
    remindersPage: { title: '提醒管理', add: '新增提醒', noReminders: '暂无提醒', titleField: '标题', dueDate: '到期日', save: '保存', cancel: '取消' },
    demo: '演示模式',
  },
  en: {
    nav: { features: 'Features', community: 'Community', pricing: 'Pricing', login: 'Log in', register: 'Sign up', getStarted: 'Get Started' },
    hero: { eyebrow: 'Your pet deserves the best', title1: 'Smart Pet', title2: 'Life Companion', sub: 'Health records, community, AI analysis — an all-in-one guardian for your furry friend.', cta: 'Sign Up Free', ctaSec: 'Learn More' },
    features: { label: 'Features', title: 'Why BestiePaw', health: 'Health Records', healthDesc: 'Vaccines, checkups, medications — auto-reminders, exportable health profiles.', social: 'Pet Community', socialDesc: 'Connect with local pet owners, share diaries, post lost & adoption info.', ai: 'AI Analysis', aiDesc: 'Upload photos for breed/age detection, symptom analysis, 24/7 AI assistance.' },
    how: { label: 'How It Works', title: 'Three Steps', s1: 'Create Account', s1d: '30-second signup', s2: 'Add Your Pet', s2d: 'Upload photo & profile', s3: 'Enjoy', s3d: 'Unlock all features' },
    cta: { title: 'Start caring for your pet today', sub: 'Core features free forever. Join now.', btn: 'Sign Up Now' },
    footer: { copy: '© 2026 BestiePaw. Every pet deserves to be loved.', privacy: 'Privacy', terms: 'Terms' },
    auth: { loginTitle: 'Welcome Back', loginSub: 'Log in to continue caring for your pet', email: 'Email', password: 'Password', confirmPwd: 'Confirm Password', username: 'Username', phone: 'Phone (optional)', forgot: 'Forgot password?', loginBtn: 'Log In', registerTitle: 'Create Account', registerSub: 'Join BestiePaw and build a profile for your pet', registerBtn: 'Sign Up & Continue', noAccount: "Don't have an account?", hasAccount: 'Already have an account?', agree: 'I agree to the', terms: 'Terms of Service', and: 'and', privacy: 'Privacy Policy', step1: 'Account', step2: 'Pet Info', step3: 'Done', socialApple: 'Apple', socialGoogle: 'Google', orEmail: 'or use email', pwdStrength: ['Weak', 'Fair', 'Good', 'Strong'], showPwd: 'Show', hidePwd: 'Hide' },
    pet: { title: 'Tell us about your pet', sub: 'The more detail, the better our health advice.', tip: 'You can update this anytime.', name: 'Pet Name', nameP: "What's their name?", type: 'Pet Type', breed: 'Breed', breedP: 'e.g. Golden Retriever', birthday: 'Birthday (approx)', gender: 'Gender', male: 'Male', female: 'Female', unknown: 'Unknown', weight: 'Weight (kg)', neutered: 'Neutered/Spayed', allergies: 'Known allergies/conditions', note: 'Additional notes', save: 'Save & Continue', skip: 'Skip for now', photo: 'Upload pet photo (optional)', dog: 'Dog', cat: 'Cat', rabbit: 'Rabbit', bird: 'Bird', fish: 'Fish', other: 'Other', yes: 'Yes', no: 'No', unsure: 'Not sure', select: 'Select' },
    complete: { title: 'All Set!', sub: "Your pet's profile is ready. Start exploring.", btn: 'Go to Dashboard' },
    dash: { overview: 'Overview', health: 'Health', community: 'Community', ai: 'AI Assistant', reminders: 'Reminders', profile: 'Profile', myPets: 'My Pets', addPet: 'Add Pet', hello: 'Hello', noPets: 'No pets yet', noPetsDesc: 'Add your first furry friend above', upcoming: 'Upcoming', healthTimeline: 'Health Timeline', quickActions: 'Quick Actions', addRecord: 'Add Record', setReminder: 'Set Reminder', viewAll: 'View All', logout: 'Log Out' },
    healthPage: { title: 'Health Management', addRecord: 'Add Record', noRecords: 'No records yet', vaccine: 'Vaccine', checkup: 'Checkup', medication: 'Medication', surgery: 'Surgery', type: 'Type', date: 'Date', description: 'Description', titleField: 'Title', save: 'Save', cancel: 'Cancel', all: 'All' },
    communityPage: { title: 'Pet Community', write: 'New Post', placeholder: 'Share your pet story...', post: 'Post', likes: 'likes', comments: 'comments' },
    aiPage: { title: 'AI Assistant', placeholder: 'Describe your pet\'s symptoms...', send: 'Send', welcome: "Hi! I'm BestiePaw AI. I can help analyze your pet's health concerns. Describe your question and I'll provide preliminary advice.", disclaimer: 'AI suggestions are for reference only. Seek veterinary care for emergencies.' },
    profilePage: { title: 'Settings', basic: 'Basic Info', save: 'Save Changes', langLabel: 'Language / 语言', dangerZone: 'Danger Zone', deleteAccount: 'Delete Account' },
    remindersPage: { title: 'Reminders', add: 'Add Reminder', noReminders: 'No reminders', titleField: 'Title', dueDate: 'Due Date', save: 'Save', cancel: 'Cancel' },
    demo: 'Demo Mode',
  },
} as const;

export type SupportedLanguage = keyof typeof translations;

export const AuthContext = createContext<any>(null);
export const LangContext = createContext<{ lang: SupportedLanguage; setLang?: (l: SupportedLanguage) => void }>({ lang: 'zh' });
export const ToastContext = createContext<any>(null);

export function useAuth() { return useContext(AuthContext); }
export function useLang() { return useContext(LangContext); }
export function useT() { 
  const { lang } = useLang(); 
  return translations[lang] || translations['zh']; 
}
export function useToast() { return useContext(ToastContext); }
