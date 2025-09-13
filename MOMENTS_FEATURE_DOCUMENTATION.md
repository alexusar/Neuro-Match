
## 📁 File Structure & Responsibilities

### 🔧 Backend Files

#### `/backend/src/models/moment.ts`
**Purpose**: Database schema definition
- Defines the Moment data structure
- Includes user reference, video URL, caption, likes, and comments
- Sets up comment sub-schema with user references

#### `/backend/src/controllers/momentController.ts`
**Purpose**: Business logic for moment operations
- `getAllMoments()`: Fetches all moments with user data populated
- `createMoment()`: Creates new moments with video and caption
- `likeMoment()`: Toggles like/unlike functionality
- `addComment()`: Adds comments to moments
- `deleteComment()`: Removes comments (if implemented)

#### `/backend/src/routes/momentRoutes.ts`
**Purpose**: API endpoint definitions
- `GET /`: Fetch all moments
- `POST /`: Create new moment (auth required)
- `POST /:id/like`: Like/unlike moment (auth required)
- `POST /:id/comment`: Add comment (auth required)
- `DELETE /:momentId/comment/:commentId`: Delete comment (auth required)

### 🎨 Frontend Files

#### `/frontend/src/types/moment.ts`
**Purpose**: TypeScript type definitions
- Defines Comment interface structure
- Ensures type safety across components

#### `/frontend/src/services/momentsAPI.ts`
**Purpose**: API communication layer
- `fetchMoments()`: Gets all moments from backend
- `likeMoment()`: Sends like requests
- `addComment()`: Sends comment requests
- Handles authentication and error management

#### `/frontend/src/components/MomentsUI.tsx`
**Purpose**: Main moments feed component
- Displays vertical scrolling feed of moments
- Manages loading states and error handling
- Implements snap-scroll behavior (TikTok-like)
- Fetches user data from localStorage

#### `/frontend/src/components/MomentVideo.tsx`
**Purpose**: Individual video player component
- Handles video playback and controls
- Manages play/pause on scroll
- Integrates sidebar and footer components
- Controls video visibility and interaction

#### `/frontend/src/components/MomentSidebar.tsx`
**Purpose**: Right-side interaction panel
- Like button with heart animation
- Comment button and comment display
- User profile navigation
- Real-time interaction updates

#### `/frontend/src/components/MomentFooter.tsx`
**Purpose**: Bottom overlay with user info
- Displays username and avatar
- Shows video caption/description
- Music/sound attribution
- Creator information

#### `/frontend/src/components/MomentProfileUI.tsx`
**Purpose**: User profile with moments grid
- Shows user's moments in grid layout
- Tabs for moments vs posts
- Profile information display
- Moment thumbnail previews

#### `/frontend/src/pages/MomentProfilePage.tsx`
**Purpose**: Profile page wrapper
- Handles URL parameters for user profiles
- Manages user authentication state
- Routes to MomentProfileUI component

## 🔄 Data Flow Workflow

### 1. **Viewing Moments Feed**
```
User opens app → MomentsUI loads → fetchMoments() API call → 
Backend getAllMoments() → Database query → Populated moments returned → 
MomentVideo components render → Videos display in feed
```

### 2. **Creating a Moment**
```
User uploads video → Form submission → createMoment() API call → 
Backend validation → Save to database → Return populated moment → 
UI updates with new moment
```

### 3. **Liking a Moment**
```
User clicks heart → likeMoment() API call → Backend finds moment → 
Toggle like status → Save to database → Return updated moment → 
UI updates heart state and count
```

### 4. **Adding Comments**
```
User types comment → Submit → addComment() API call → 
Backend validates → Add to moment.comments → Save → 
Return updated moment → UI shows new comment
```

### 5. **Profile View**
```
User visits profile → MomentProfilePage loads → 
Fetch user moments → Display in grid → 
Click thumbnail → Open full video view
```

## 🔗 Component Relationships

```
MomentsUI (Main Feed)
├── MomentVideo (Individual Video)
│   ├── MomentSidebar (Interactions)
│   └── MomentFooter (User Info)
│
MomentProfilePage (Profile Route)
└── MomentProfileUI (Profile Display)
    └── MomentVideo (Grid Items)

DashboardUI (Dashboard)
└── MomentsUI (Embedded Feed)
```

## 🔐 Authentication Flow

1. **User Authentication**: Stored in localStorage
2. **API Requests**: Include `withCredentials: true`
3. **Backend Middleware**: `requireAuth` validates user sessions
4. **User Context**: Passed through components for personalization

