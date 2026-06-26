// 向后兼容：从全局 AuthContext 重新导出 useAuth
// 新代码请直接 import { useAuth } from '../context/AuthContext'
export { useAuth, type AuthUser } from '../context/AuthContext';
