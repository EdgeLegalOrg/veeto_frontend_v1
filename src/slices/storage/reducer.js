import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getStorageTypeApi, saveStorageTypeApi } from "pages/Edge/apis";

export const fetchStorageType = createAsyncThunk(
  "Storage/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getStorageTypeApi();
      console.log("storage api response:", data); // ← add this temporarily
      return data.data;
    } catch (err) {
      console.error("storage api error:", err);
      return rejectWithValue(err);
    }
  },
);

export const saveStorageType = createAsyncThunk(
  "Storage/save",
  async (storageType, { rejectWithValue }) => {
    try {
      await saveStorageTypeApi({ storageType });
      return storageType;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

const getInitialStorageType = () => {
  if (typeof window === "undefined") return "ONEDRIVE";

  const stored = window.localStorage.getItem("edge-storage-type");
  return stored || "ONEDRIVE";
};

const initialState = {
  storageType: getInitialStorageType(),
  loading: false,
  saving: false,
};

const storageSlice = createSlice({
  name: "Storage",
  initialState,
  reducers: {
    setStorageType: (state, action) => {
      state.storageType = action.payload;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("edge-storage-type", action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchStorageType.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStorageType.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchStorageType.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.storageType = action.payload;
          localStorage.setItem("edge-storage-type", action.payload);
        }
      })

      // save
      .addCase(saveStorageType.pending, (state) => {
        state.saving = true;
      })
      .addCase(saveStorageType.rejected, (state) => {
        state.saving = false;
      })
      .addCase(saveStorageType.fulfilled, (state, action) => {
        state.saving = false;
        state.storageType = action.payload;
        localStorage.setItem("edge-storage-type", action.payload);
      });
  },
});

export const { setStorageType } = storageSlice.actions;
export const selectStorageType = (state) =>
  state.Storage?.storageType || "ONEDRIVE";
export const selectStorageSaving = (state) => state.Storage?.saving;
export default storageSlice.reducer;
