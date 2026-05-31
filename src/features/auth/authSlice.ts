import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginCustomer,
  logoutCustomer,
  registerCustomer,
  getCustomerProfile,
} from "../../services/authApi";
import {
  getProfile,
  updateProfileApi,
} from "../../services/customerApi";
import type { AuthState, CustomerUser } from "../../types/auth";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Safely parse localStorage; wipes invalid values automatically. */
const loadUser = (): CustomerUser | null => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw || raw === "undefined" || raw === "null") return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && (parsed.id || parsed._id || parsed.phone)) {
      return parsed as CustomerUser;
    }
    return null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

/** Walk a response body and find the user object wherever the backend put it. */
const extractUserRaw = (body: any): any => {
  if (!body || typeof body !== "object") return null;
  // Ordered from most-specific to most-general
  if (body.data?.user)                    return body.data.user;
  if (body.data?.customer)                return body.data.customer;
  if (body.user)                          return body.user;
  if (body.customer)                      return body.customer;
  // data itself looks like a user (has phone or _id)
  if (body.data?.phone || body.data?._id) return body.data;
  return null;
};

/** Map any raw user object → typed CustomerUser (handles _id vs id). */
const normaliseUser = (raw: any, fallback: Partial<CustomerUser> = {}): CustomerUser => ({
  id:              raw?.id || raw?._id || fallback.id || "",
  phone:           raw?.phone || fallback.phone || "",
  email:           raw?.email || fallback.email,
  name:            raw?.name || raw?.fullName || fallback.name,
  isPhoneVerified: raw?.isPhoneVerified ?? fallback.isPhoneVerified ?? false,
});

const saveUser = (user: CustomerUser) =>
  localStorage.setItem("user", JSON.stringify(user));

// ── Thunks ───────────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    data: { email?: string; phone?: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const body = await loginCustomer(data);
      let raw = extractUserRaw(body);

      // Backend may return { success: true } with user only in cookies.
      // Fetch profile as fallback to get the user object.
      if (!raw) {
        try {
          const profileBody = await getCustomerProfile();
          raw = extractUserRaw(profileBody) ?? profileBody?.data ?? profileBody;
        } catch {
          // Profile endpoint doesn't exist — build minimal user from credentials
        }
      }

      const user = normaliseUser(raw, {
        phone: data.phone,
        email: data.email,
      });
      saveUser(user);
      return user;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Login failed"
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    data: { phone: string; otp: string; password: string; email?: string; name?: string },
    { rejectWithValue }
  ) => {
    try {
      const body = await registerCustomer(data);
      let raw = extractUserRaw(body);

      if (!raw) {
        try {
          const profileBody = await getCustomerProfile();
          raw = extractUserRaw(profileBody) ?? profileBody?.data ?? profileBody;
        } catch { /* ignore */ }
      }

      const user = normaliseUser(raw, {
        phone: data.phone,
        email: data.email,
        name: data.name,
      });
      saveUser(user);
      return user;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Registration failed"
      );
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrent",
  async (_, { getState, rejectWithValue }) => {
    try {
      // getProfile() → res.data.data.user (direct user object)
      let raw: any = null;
      try {
        raw = await getProfile();
      } catch {
        // Fallback: generic auth profile endpoint
        const body = await getCustomerProfile();
        raw = extractUserRaw(body) ?? body?.data;
      }
      const current = (getState() as any).auth.user as CustomerUser | null;
      const user = normaliseUser({ ...(current || {}), ...(raw || {}) });
      saveUser(user);
      return user;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to load profile"
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (
    data: { name?: string; email?: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const current = (getState() as any).auth.user as CustomerUser;

      // updateProfileApi() → res.data.data.user (updated user object)
      let raw: any = null;
      try {
        raw = await updateProfileApi(data);
      } catch {
        // Backend returned non-2xx — re-throw so outer catch handles it
        throw new Error("Profile update failed");
      }

      // Merge: current user base → server response → explicit input values
      // (input values override in case server echoes stale data)
      const merged = {
        ...current,
        ...(raw || {}),
        ...(data.name  !== undefined ? { name:  data.name  } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
      };
      const user = normaliseUser(merged);
      saveUser(user);
      return user;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error  ||
        err.message ||
        "Update failed"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async () => {
    try { await logoutCustomer(); } catch { /* ignore */ }
    localStorage.removeItem("user");
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState: AuthState = {
  user: loadUser(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending  = (state: AuthState) => { state.loading = true;  state.error = null; };
    const rejected = (state: AuthState, action: any) => {
      state.loading = false;
      state.error   = action.payload as string;
    };

    builder
      .addCase(loginUser.pending,   pending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user    = action.payload;
      })
      .addCase(loginUser.rejected,  rejected)

      .addCase(registerUser.pending,   pending)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user    = action.payload;
      })
      .addCase(registerUser.rejected,  rejected)

      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })

      .addCase(updateProfile.pending,   pending)
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user    = action.payload;
      })
      .addCase(updateProfile.rejected,  rejected)

      .addCase(logoutUser.fulfilled, (state) => {
        state.user  = null;
        state.error = null;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
