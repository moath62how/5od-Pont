# Leaderboard Voting System (لوحة البونطات)

A gamified social voting platform where users compete for points through community voting.

## MVP Overview

### Core Value Proposition
A real-time leaderboard system where users earn points ("بونطات") through peer voting. Community members create time-limited votes with images targeting specific players, and the community decides whether to award points.

### Target Users
- Small communities, friend groups, or teams looking for a fun, competitive social engagement platform
- Users who enjoy gamification and social recognition

---

## Key Features

### 1. **User Authentication**
- Sign up with name, email, and password
- Secure login/logout functionality
- Profile management with custom avatars
- Powered by Supabase Auth

### 2. **Dynamic Leaderboard**
- **Top 3 Display**: Visual showcase of top performers with medals and fire animations
- **Bottom 3 Display**: Humorous "worst performers" section with egg decorations
- **Full Rankings**: Complete list of all players sorted by points
- Real-time point updates
- Avatar generation using DiceBear API

### 3. **Voting System**
- **Create Votes**: Upload an image, write a title, select a target player, and set duration (1 min - 24 hours)
- **Cast Votes**: Community votes "بونط" (award point) or "احبنه" (deny point)
- **Time-Limited**: Automatic vote expiration with countdown timers
- **Visual Progress**: Real-time vote count with progress bars
- **Automatic Point Award**: Winner gets +1 point when "بونط" wins majority

### 4. **Profile Management**
- View personal stats (name, email, points)
- Upload custom profile pictures
- Stored in Supabase Storage

### 5. **Responsive UI**
- Arabic RTL (right-to-left) interface
- Dark theme with gradient backgrounds
- Mobile-friendly design
- Smooth animations and transitions
- Device tilt effects on login page

---

## Technical Stack

### Frontend
- **HTML5**: Semantic structure
- **Tailwind CSS**: Utility-first styling
- **Font Awesome**: Icon library
- **GSAP**: Animation library
- **Vanilla JavaScript**: No framework dependencies

### Backend
- **Supabase**: 
  - Authentication
  - PostgreSQL database
  - Real-time subscriptions
  - File storage

### Database Schema
```
users
├── id (uuid, primary key)
├── name (text)
├── email (text)
├── points (integer)
└── profile_pic (text, nullable)

votes
├── id (uuid, primary key)
├── title (text)
├── image_path (text)
├── created_by (uuid, foreign key → users)
├── target_user_id (uuid, foreign key → users)
├── end_time (timestamp)
├── is_deleted (boolean)
└── created_at (timestamp)

user_votes
├── user_id (uuid, foreign key → users)
├── vote_id (uuid, foreign key → votes)
├── choice (text: 'with' or 'against')
└── created_at (timestamp)
```

---

## User Flows

### New User Journey
1. Visit homepage → See leaderboard (read-only)
2. Click profile button → Prompted to login/signup
3. Create account → Redirected to login
4. Login → Access full features

### Creating a Vote
1. Navigate to voting page
2. Enter vote title
3. Select target player from dropdown
4. Upload image
5. Set duration (minutes)
6. Submit → Vote appears in feed

### Voting Process
1. Browse active votes
2. See countdown timer and current results
3. Click "بونط" (award) or "احبنه" (deny)
4. Vote recorded (one vote per user per vote)
5. When timer expires:
   - If "بونط" wins → Target player gets +1 point
   - Vote automatically deleted
   - Leaderboard updates

---

## File Structure

```
├── index.html          # Main leaderboard page
├── login.html          # Login page
├── sign-up.html        # Registration page
├── vote.html           # Voting interface
├── profile.html        # User profile settings
└── js/
    ├── config.js       # Supabase configuration
    ├── supabase.js     # Supabase client wrapper
    ├── auth.js         # Authentication functions
    ├── leaderboard.js  # Leaderboard rendering
    ├── vote.js         # Voting system logic
    └── utils.js        # Utility functions
```

---

## Key MVP Decisions

### What's Included
✅ Core voting mechanics  
✅ Point system with automatic awards  
✅ Real-time leaderboard  
✅ Time-limited votes  
✅ Image uploads  
✅ User authentication  
✅ Profile customization  

### What's Excluded (Future Enhancements)
❌ Vote comments/discussions  
❌ Vote categories/tags  
❌ Point history/audit log  
❌ Notifications  
❌ Social sharing  
❌ Admin moderation panel  
❌ Vote editing/deletion by creator  
❌ Multiple vote types  

---

## Setup Instructions

### Prerequisites
- Supabase account
- Modern web browser
- Web server (local or hosted)

### Configuration
1. Create a Supabase project
2. Set up database tables (users, votes, user_votes)
3. Create storage buckets (images, profile-pics)
4. Update `js/config.js` with your Supabase credentials:
   ```javascript
   const CONFIG = {
       SUPABASE_URL: "your-project-url",
       SUPABASE_KEY: "your-anon-key"
   };
   ```

### Deployment
1. Upload all files to web server
2. Ensure proper CORS settings in Supabase
3. Configure storage bucket policies for public read access
4. Test authentication flow

---

## Security Considerations

### Implemented
- Supabase Row Level Security (RLS) policies
- XSS prevention through HTML escaping
- Secure password handling via Supabase Auth
- One vote per user per vote enforcement

### Recommended Additions
- Rate limiting on vote creation
- Image content moderation
- Email verification
- CAPTCHA on signup
- Vote abuse reporting

---

## Performance Optimizations

- Lazy loading of images
- Efficient database queries with proper indexing
- Client-side caching of user data
- Minimal external dependencies
- CDN-hosted libraries

---

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## License

This project is provided as-is for educational and personal use.

---

## Credits

- **UI Framework**: Tailwind CSS
- **Icons**: Font Awesome
- **Avatar Generation**: DiceBear API
- **Backend**: Supabase
- **Animations**: GSAP

---

## Future Roadmap

### Phase 2
- Push notifications for vote results
- Vote categories (funny, achievement, fail)
- Weekly/monthly leaderboard resets
- Achievement badges

### Phase 3
- Team competitions
- Vote templates
- Analytics dashboard
- Mobile app (React Native)

---

## Support

For issues or questions, please refer to the Supabase documentation or create an issue in the project repository.
