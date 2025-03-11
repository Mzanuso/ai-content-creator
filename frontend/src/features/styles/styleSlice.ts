import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Types
export interface Style {
  srefCode: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  previewUrl?: string;
  exampleUrls?: string[];
  recommendedKeywords?: string[];
}

export interface StyleCategory {
  name: string;
  description?: string;
  count: number;
}

interface StylesState {
  styles: Style[];
  categories: StyleCategory[];
  recommendedStyles: Style[];
  selectedStyle: Style | null;
  filteredStyles: Style[];
  isLoading: boolean;
  error: string | null;
}

// Async thunks
export const fetchStyles = createAsyncThunk(
  'styles/fetchStyles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getStyles();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch styles');
    }
  }
);

export const fetchStyleDetail = createAsyncThunk(
  'styles/fetchStyleDetail',
  async (srefCode: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getStyleDetail(srefCode);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch style details');
    }
  }
);

// Initial state
const initialState: StylesState = {
  styles: [],
  categories: [],
  recommendedStyles: [],
  selectedStyle: null,
  filteredStyles: [],
  isLoading: false,
  error: null,
};

// Create slice
const stylesSlice = createSlice({
  name: 'styles',
  initialState,
  reducers: {
    clearStyleError: (state) => {
      state.error = null;
    },
    setSelectedStyle: (state, action: PayloadAction<Style | null>) => {
      state.selectedStyle = action.payload;
    },
    filterStyles: (state, action: PayloadAction<{ category?: string; tag?: string; keyword?: string }>) => {
      const { category, tag, keyword } = action.payload;
      
      state.filteredStyles = state.styles.filter(style => {
        // Filter by category if provided
        if (category && style.category !== category) {
          return false;
        }
        
        // Filter by tag if provided
        if (tag && !style.tags?.includes(tag)) {
          return false;
        }
        
        // Filter by keyword if provided
        if (keyword && !style.name.toLowerCase().includes(keyword.toLowerCase()) &&
            !style.description?.toLowerCase().includes(keyword.toLowerCase()) &&
            !style.recommendedKeywords?.some(k => k.toLowerCase().includes(keyword.toLowerCase()))) {
          return false;
        }
        
        return true;
      });
    },
    
    // For development/demo
    setMockStyles: (state, action: PayloadAction<Style[]>) => {
      state.styles = action.payload;
      state.filteredStyles = action.payload;
      
      // Extract categories
      const categoryMap = new Map<string, number>();
      
      action.payload.forEach(style => {
        if (style.category) {
          const count = categoryMap.get(style.category) || 0;
          categoryMap.set(style.category, count + 1);
        }
      });
      
      state.categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
        name,
        count,
      }));
      
      // Set recommended styles (first 5 for demo)
      state.recommendedStyles = action.payload.slice(0, 5);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch styles
      .addCase(fetchStyles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStyles.fulfilled, (state, action: PayloadAction<Style[]>) => {
        state.isLoading = false;
        state.styles = action.payload;
        state.filteredStyles = action.payload;
        
        // Extract categories
        const categoryMap = new Map<string, number>();
        
        action.payload.forEach(style => {
          if (style.category) {
            const count = categoryMap.get(style.category) || 0;
            categoryMap.set(style.category, count + 1);
          }
        });
        
        state.categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
          name,
          count,
        }));
        
        // Set recommended styles (first 5 for now)
        state.recommendedStyles = action.payload.slice(0, 5);
      })
      .addCase(fetchStyles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch style detail
      .addCase(fetchStyleDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStyleDetail.fulfilled, (state, action: PayloadAction<Style>) => {
        state.isLoading = false;
        state.selectedStyle = action.payload;
        
        // Update style in the list if it exists
        const index = state.styles.findIndex(s => s.srefCode === action.payload.srefCode);
        if (index !== -1) {
          state.styles[index] = action.payload;
        }
      })
      .addCase(fetchStyleDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearStyleError, 
  setSelectedStyle, 
  filterStyles, 
  setMockStyles 
} = stylesSlice.actions;

export default stylesSlice.reducer;
