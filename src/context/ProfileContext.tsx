import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  getProfiles as apiGetProfiles,
  saveProfile as apiSaveProfile,
  deleteProfile as apiDeleteProfile,
  type ProfileDTO,
  type ProfileInput,
} from '../lib/profile-api';

export type { ProfileInput, ProfilePillars } from '../lib/profile-api';

/** 前端档案：在云端 DTO 基础上增加 source 标记来源 */
export interface Profile extends ProfileDTO {
  source: 'local' | 'cloud';
}

interface ProfileContextValue {
  profiles: Profile[];
  currentProfile: Profile | null;
  currentProfileId: string | null;
  setCurrentProfileId: (id: string | null) => void;
  loading: boolean;
  saveProfile: (payload: ProfileInput) => Promise<boolean>;
  deleteProfile: (id: string) => Promise<boolean>;
  uploadLocalToCloud: () => Promise<number>;
  refresh: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

const LOCAL_KEY = 'iching_local_profiles';
const CURRENT_KEY = 'iching_current_profile';

function readLocal(): Profile[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as Profile[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(list: Profile[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function genLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { token, isLoggedIn } = useAuth();
  const [cloudProfiles, setCloudProfiles] = useState<Profile[]>([]);
  const [localProfiles, setLocalProfiles] = useState<Profile[]>(readLocal);
  const [currentProfileId, setCurrentProfileIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CURRENT_KEY);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) {
      setCloudProfiles([]);
      return;
    }
    setLoading(true);
    try {
      const res = await apiGetProfiles(token);
      if (res.success && res.data) {
        setCloudProfiles(res.data.map((p) => ({ ...p, source: 'cloud' as const })));
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const profiles = useMemo<Profile[]>(
    () => [...cloudProfiles, ...localProfiles],
    [cloudProfiles, localProfiles],
  );

  const setCurrentProfileId = useCallback((id: string | null) => {
    setCurrentProfileIdState(id);
    try {
      if (id) localStorage.setItem(CURRENT_KEY, id);
      else localStorage.removeItem(CURRENT_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const currentProfile = useMemo(
    () => profiles.find((p) => p.id === currentProfileId) ?? null,
    [profiles, currentProfileId],
  );

  const saveProfile = useCallback(
    async (payload: ProfileInput): Promise<boolean> => {
      if (token && isLoggedIn) {
        const res = await apiSaveProfile(token, payload);
        if (res.success) {
          await refresh();
          return true;
        }
        return false;
      }
      // 未登录：写本地（按 name 覆盖）
      const list = readLocal();
      const idx = list.findIndex((x) => x.name === payload.name);
      const now = Date.now();
      const newProfile: Profile = {
        ...payload,
        id: idx >= 0 ? list[idx].id : genLocalId(),
        userId: '',
        createdAt: idx >= 0 ? list[idx].createdAt : now,
        source: 'local',
      };
      if (idx >= 0) list[idx] = newProfile;
      else list.push(newProfile);
      writeLocal(list);
      setLocalProfiles([...list]);
      return true;
    },
    [token, isLoggedIn, refresh],
  );

  const deleteProfile = useCallback(
    async (id: string): Promise<boolean> => {
      const localList = readLocal();
      if (localList.some((p) => p.id === id)) {
        const next = localList.filter((p) => p.id !== id);
        writeLocal(next);
        setLocalProfiles([...next]);
        if (currentProfileId === id) setCurrentProfileId(null);
        return true;
      }
      if (token) {
        const res = await apiDeleteProfile(token, id);
        if (res.success) {
          await refresh();
          if (currentProfileId === id) setCurrentProfileId(null);
          return true;
        }
      }
      return false;
    },
    [token, currentProfileId, refresh, setCurrentProfileId],
  );

  const uploadLocalToCloud = useCallback(async (): Promise<number> => {
    if (!token) return 0;
    const locals = readLocal();
    if (locals.length === 0) return 0;
    let count = 0;
    const remaining: Profile[] = [];
    for (const p of locals) {
      const payload: ProfileInput = {
        name: p.name,
        inputMode: p.inputMode,
        gender: p.gender,
        year: p.year,
        month: p.month,
        day: p.day,
        hour: p.hour,
        minute: p.minute,
        birthplace: p.birthplace,
        useSolarTime: p.useSolarTime,
        pillars: p.pillars,
      };
      const res = await apiSaveProfile(token, payload);
      if (res.success) count++;
      else remaining.push(p);
    }
    writeLocal(remaining);
    setLocalProfiles([...remaining]);
    await refresh();
    return count;
  }, [token, refresh]);

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        currentProfile,
        currentProfileId,
        setCurrentProfileId,
        loading,
        saveProfile,
        deleteProfile,
        uploadLocalToCloud,
        refresh,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
