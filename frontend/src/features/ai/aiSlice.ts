import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

// Types
export interface ScreenplayGenerationRequest {
  concept: string;
  styleDescription?: string;
  targetDuration?: number;
  tone?: string;
  genre?: string;
}

export interface ScreenplaySection {
  id: string;
  text: string;
  order: number;
}

export interface Screenplay {
  concept: string;
  sections: ScreenplaySection[];
}

export interface SectionRefinementRequest {
  sectionId: string;
  screenplayId: string;
  instructions: string;
}

export interface StoryboardGenerationRequest {
  screenplayId: string;
  styleDescription?: string;
}

export interface StoryboardPrompt {
  sectionId: string;
  prompt: string;
  cameraMovement?: string;
  shotType?: string;
}

export interface Storyboard {
  prompts: StoryboardPrompt[];
}

export interface ImageGenerationRequest {
  prompt: string;
  styleReference?: string;
  aspectRatio?: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

export interface VideoGenerationRequest {
  storyboardId: string;
  duration?: number;
  cameraSettings?: Record<string, any>;
}

export interface GeneratedVideo {
  id: string;
  url: string;
  duration: number;
}

export interface AudioGenerationRequest {
  duration: number;
  mood?: string;
  tempo?: string;
}

export interface GeneratedAudio {
  id: string;
  url: string;
  duration: number;
}

export interface VoiceoverGenerationRequest {
  text: string;
  voice?: string;
  speed?: number;
}

export interface GeneratedVoiceover {
  id: string;
  url: string;
  text: string;
  duration: number;
}

interface AIState {
  // Screenplay generation
  screenplay: Screenplay | null;
  storyboard: Storyboard | null;
  generatedImages: GeneratedImage[];
  generatedVideo: GeneratedVideo | null;
  generatedAudio: GeneratedAudio | null;
  generatedVoiceover: GeneratedVoiceover | null;
  
  // Loading states
  isGeneratingScreenplay: boolean;
  isGeneratingStoryboard: boolean;
  isGeneratingImage: boolean;
  isGeneratingVideo: boolean;
  isGeneratingAudio: boolean;
  isGeneratingVoiceover: boolean;
  
  // Errors
  error: string | null;
}

// Async thunks
export const generateScreenplay = createAsyncThunk(
  'ai/generateScreenplay',
  async (request: ScreenplayGenerationRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.generateScreenplay(request);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to generate screenplay');
    }
  }
);

export const refineScreenplaySection = createAsyncThunk(
  'ai/refineScreenplaySection',
  async (request: SectionRefinementRequest, { rejectWithValue, getState }) => {
    try {
      const response = await apiService.refineSection(request);
      return {
        sectionId: request.sectionId,
        updatedSection: response.data,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to refine section');
    }
  }
);

export const generateStoryboard = createAsyncThunk(
  'ai/generateStoryboard',
  async (request: StoryboardGenerationRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.generateStoryboard(request);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to generate storyboard');
    }
  }
);

export const generateImage = createAsyncThunk(
  'ai/generateImage',
  async (request: ImageGenerationRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.generateImage(request);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to generate image');
    }
  }
);

export const generateVideo = createAsyncThunk(
  'ai/generateVideo',
  async (request: VideoGenerationRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.generateVideo(request);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to generate video');
    }
  }
);

export const generateAudio = createAsyncThunk(
  'ai/generateAudio',
  async (request: AudioGenerationRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.generateAudio(request);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to generate audio');
    }
  }
);

export const generateVoiceover = createAsyncThunk(
  'ai/generateVoiceover',
  async (request: VoiceoverGenerationRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.generateVoiceover(request);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to generate voiceover');
    }
  }
);

// Initial state
const initialState: AIState = {
  screenplay: null,
  storyboard: null,
  generatedImages: [],
  generatedVideo: null,
  generatedAudio: null,
  generatedVoiceover: null,
  
  isGeneratingScreenplay: false,
  isGeneratingStoryboard: false,
  isGeneratingImage: false,
  isGeneratingVideo: false,
  isGeneratingAudio: false,
  isGeneratingVoiceover: false,
  
  error: null,
};

// Create slice
const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearAIError: (state) => {
      state.error = null;
    },
    clearScreenplay: (state) => {
      state.screenplay = null;
    },
    clearStoryboard: (state) => {
      state.storyboard = null;
    },
    clearGeneratedMedia: (state) => {
      state.generatedImages = [];
      state.generatedVideo = null;
      state.generatedAudio = null;
      state.generatedVoiceover = null;
    },
    setMockScreenplay: (state, action: PayloadAction<Screenplay>) => {
      state.screenplay = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate screenplay
      .addCase(generateScreenplay.pending, (state) => {
        state.isGeneratingScreenplay = true;
        state.error = null;
      })
      .addCase(generateScreenplay.fulfilled, (state, action: PayloadAction<Screenplay>) => {
        state.isGeneratingScreenplay = false;
        state.screenplay = action.payload;
      })
      .addCase(generateScreenplay.rejected, (state, action) => {
        state.isGeneratingScreenplay = false;
        state.error = action.payload as string;
      })
      
      // Refine screenplay section
      .addCase(refineScreenplaySection.pending, (state) => {
        state.isGeneratingScreenplay = true;
        state.error = null;
      })
      .addCase(refineScreenplaySection.fulfilled, (state, action: PayloadAction<{
        sectionId: string;
        updatedSection: ScreenplaySection;
      }>) => {
        state.isGeneratingScreenplay = false;
        
        if (state.screenplay) {
          const index = state.screenplay.sections.findIndex(
            s => s.id === action.payload.sectionId
          );
          
          if (index !== -1) {
            state.screenplay.sections[index] = action.payload.updatedSection;
          }
        }
      })
      .addCase(refineScreenplaySection.rejected, (state, action) => {
        state.isGeneratingScreenplay = false;
        state.error = action.payload as string;
      })
      
      // Generate storyboard
      .addCase(generateStoryboard.pending, (state) => {
        state.isGeneratingStoryboard = true;
        state.error = null;
      })
      .addCase(generateStoryboard.fulfilled, (state, action: PayloadAction<Storyboard>) => {
        state.isGeneratingStoryboard = false;
        state.storyboard = action.payload;
      })
      .addCase(generateStoryboard.rejected, (state, action) => {
        state.isGeneratingStoryboard = false;
        state.error = action.payload as string;
      })
      
      // Generate image
      .addCase(generateImage.pending, (state) => {
        state.isGeneratingImage = true;
        state.error = null;
      })
      .addCase(generateImage.fulfilled, (state, action: PayloadAction<GeneratedImage>) => {
        state.isGeneratingImage = false;
        state.generatedImages.push(action.payload);
      })
      .addCase(generateImage.rejected, (state, action) => {
        state.isGeneratingImage = false;
        state.error = action.payload as string;
      })
      
      // Generate video
      .addCase(generateVideo.pending, (state) => {
        state.isGeneratingVideo = true;
        state.error = null;
      })
      .addCase(generateVideo.fulfilled, (state, action: PayloadAction<GeneratedVideo>) => {
        state.isGeneratingVideo = false;
        state.generatedVideo = action.payload;
      })
      .addCase(generateVideo.rejected, (state, action) => {
        state.isGeneratingVideo = false;
        state.error = action.payload as string;
      })
      
      // Generate audio
      .addCase(generateAudio.pending, (state) => {
        state.isGeneratingAudio = true;
        state.error = null;
      })
      .addCase(generateAudio.fulfilled, (state, action: PayloadAction<GeneratedAudio>) => {
        state.isGeneratingAudio = false;
        state.generatedAudio = action.payload;
      })
      .addCase(generateAudio.rejected, (state, action) => {
        state.isGeneratingAudio = false;
        state.error = action.payload as string;
      })
      
      // Generate voiceover
      .addCase(generateVoiceover.pending, (state) => {
        state.isGeneratingVoiceover = true;
        state.error = null;
      })
      .addCase(generateVoiceover.fulfilled, (state, action: PayloadAction<GeneratedVoiceover>) => {
        state.isGeneratingVoiceover = false;
        state.generatedVoiceover = action.payload;
      })
      .addCase(generateVoiceover.rejected, (state, action) => {
        state.isGeneratingVoiceover = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearAIError,
  clearScreenplay,
  clearStoryboard,
  clearGeneratedMedia,
  setMockScreenplay,
} = aiSlice.actions;

export default aiSlice.reducer;
