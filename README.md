# Meteor.js 3.2 + React Application with NobleUI Admin Template

This README outlines the recommended directory structure and development practices for a Meteor.js 3.2 application using React with the NobleUI admin template. This guide focuses on refactoring from Meteor 2.5 + Angular to Meteor 3.0+ + React, highlighting key migration considerations and modern best practices.

## Application Overview

This application includes:

- User authentication with registration that requires admin approval
- Role-based access control (admin vs. regular users)
- Modern UI with NobleUI admin template
- Responsive design using SCSS
- Feature modules:
  - User management (admin only)
  - User profile management
  - FAQ page
  - Welcome dashboard

## Migration from Meteor 2.5 + Angular to Meteor 3.x + React

This project involves refactoring from Meteor 2.5 with Angular to Meteor 3.x with React. Key migration considerations include:

1. **Asynchronous Code**: Meteor 3.x removes fibers, requiring all synchronous code to be converted to async/await

2. **Package Updates**: Several Meteor packages will need updates or replacements:
   - `angular-meteor` → React integration with `react-meteor-data`
   - `blaze-html-templates` → No longer needed with React
   - `kadira:flow-router` → Replace with React Router

3. **Component Architecture**: Convert Angular components to React components
   - Angular controllers → React hooks and component state
   - Angular services → React contexts or custom hooks
   - Angular templates → JSX in React components

4. **Authentication Flow**: Maintain the same user authentication model while implementing with React
   - Accounts-ui → Custom React components for auth
   - Angular permission handling → React-based auth protection

5. **Data Handling**:
   - Angular's reactive data → React hooks with `useTracker`
   - Two-way data binding → Explicit state updates in React

## Directory Structure

```
project-root/
├── .meteor/                                # Meteor-specific files (auto-generated)
├── client/                                 # Client-only code
│   ├── main.jsx                            # Client entry point
│   ├── main.html                           # Main HTML file with root element
│   └── main.scss                           # Main SCSS file (imports NobleUI styles)
├── server/                                 # Server-only code
│   └── main.js                             # Server entry point
├── imports/                                # Modules loaded on demand
│   ├── api/                                # Backend functionality by domain
│   │   ├── users/                          # Users domain
│   │   │   ├── collection.js               # User collection extensions
│   │   │   ├── methods.js                  # User-related methods
│   │   │   ├── publications.js             # User-related publications
│   │   │   └── roles.js                    # Role definitions and helpers
│   │   ├── auth/                           # Authentication domain
│   │   │   ├── methods.js                  # Auth-related methods (login, register)
│   │   │   ├── server/                     # Server-only auth code
│   │   │   │   ├── accounts-config.js      # Accounts package configuration
│   │   │   │   └── email-templates.js      # Email templates for verification
│   │   │   └── hooks/                      # Auth hooks
│   │   │       └── onCreateUser.js         # Custom user creation logic
│   │   └── faq/                            # FAQ domain
│   │       ├── collection.js               # FAQ collection
│   │       ├── methods.js                  # FAQ methods
│   │       └── publications.js             # FAQ publications
│   ├── ui/                                 # UI components
│   │   ├── layouts/                        # Layout components
│   │   │   └── MainLayout/                 # Main application layout
│   │   │       ├── MainLayout.jsx          # Layout component with sidebar and navbar
│   │   │       └── MainLayout.scss         # Layout styling
│   │   ├── components/                     # Reusable components
│   │   │   ├── common/                     # Shared components
│   │   │   │   ├── Button/                 # Button component
│   │   │   │   ├── Card/                   # Card component
│   │   │   │   ├── Alert/                  # Alert/notification component
│   │   │   │   │   ├── Alert.jsx           # Alert component
│   │   │   │   │   └── Alert.scss          # Alert styling
│   │   │   │   ├── Dropdown/               # Dropdown component for navbar
│   │   │   │   │   ├── Dropdown.jsx        # Dropdown component
│   │   │   │   │   └── Dropdown.scss       # Dropdown styling
│   │   │   │   ├── Navbar/                 # Navigation bar
│   │   │   │   │   ├── Navbar.jsx          # Navbar with user dropdown
│   │   │   │   │   └── Navbar.scss         # Navbar styling
│   │   │   │   └── Sidebar/                # Sidebar navigation
│   │   │   │       ├── Sidebar.jsx         # Sidebar with navigation links
│   │   │   │       ├── SidebarItem.jsx     # Individual sidebar menu item
│   │   │   │       └── Sidebar.scss        # Sidebar styling
│   │   │   ├── users/                      # User-specific components
│   │   │   │   ├── UserForm/               # User form component
│   │   │   │   │   ├── UserForm.jsx        # User edit form
│   │   │   │   │   └── UserForm.scss       # Form styling
│   │   │   │   ├── UserList/               # User list component for admin
│   │   │   │   │   ├── UserList.jsx        # List of users
│   │   │   │   │   ├── UserItem.jsx        # Individual user item
│   │   │   │   │   └── UserList.scss       # List styling
│   │   │   │   └── UserAvatar/             # User avatar component
│   │   │   │       ├── UserAvatar.jsx      # Avatar with user initials/image
│   │   │   │       └── UserAvatar.scss     # Avatar styling
│   │   │   └── faq/                        # FAQ components
│   │   │       └── FaqList/                # FAQ list component
│   │   │           ├── FaqList.jsx         # FAQ list
│   │   │           ├── FaqItem.jsx         # Individual FAQ item
│   │   │           └── FaqList.scss        # FAQ styling
│   │   ├── pages/                          # Page components
│   │   │   ├── dashboard/                  # Dashboard pages
│   │   │   │   └── Home/                   # Home dashboard
│   │   │   │       ├── Home.jsx            # Welcome dashboard
│   │   │   │       └── Home.scss           # Dashboard styling
│   │   │   ├── users/                      # User pages
│   │   │   │   ├── UserManagement/         # Admin user management page
│   │   │   │   │   ├── UserManagement.jsx  # User management page
│   │   │   │   │   └── UserManagement.scss # Page styling
│   │   │   │   └── UserProfile/            # User profile page
│   │   │   │       ├── UserProfile.jsx     # Profile edit page
│   │   │   │       └── UserProfile.scss    # Profile styling
│   │   │   ├── auth/                       # Authentication pages
│   │   │   │   ├── Login/                  # Login page
│   │   │   │   │   ├── Login.jsx           # Login form
│   │   │   │   │   └── Login.scss          # Login styling
│   │   │   │   ├── Register/               # Registration page
│   │   │   │   │   ├── Register.jsx        # Registration form
│   │   │   │   │   └── Register.scss       # Registration styling
│   │   │   │   ├── ForgotPassword/         # Password recovery page
│   │   │   │   │   ├── ForgotPassword.jsx  # Password reset request
│   │   │   │   │   └── ForgotPassword.scss # Page styling
│   │   │   │   └── ResetPassword/          # Password reset page
│   │   │   │       ├── ResetPassword.jsx   # Password reset form
│   │   │   │       └── ResetPassword.scss  # Page styling
│   │   │   └── faq/                        # FAQ pages
│   │   │       └── FaqPage/                # FAQ page
│   │   │           ├── FaqPage.jsx         # FAQ page component
│   │   │           └── FaqPage.scss        # FAQ page styling
│   │   └── contexts/                       # React contexts
│   │       ├── AuthContext.jsx             # Authentication context
│   │       ├── UserContext.jsx             # User data context
│   │       ├── NotificationContext.jsx     # App notifications context
│   │       └── AppContext.jsx              # Application context
│   ├── startup/                            # Startup configuration
│   │   ├── client/                         # Client startup
│   │   │   ├── routes.jsx                  # React Router configuration
│   │   │   └── index.js                    # Client startup index
│   │   └── server/                         # Server startup
│   │       ├── fixtures.js                 # Initial data setup
│   │       ├── accounts.js                 # Account configuration
│   │       ├── email.js                    # Email configuration
│   │       └── index.js                    # Server startup index
│   ├── hooks/                              # Custom React hooks
│   │   ├── useUser.js                      # Hook for user data
│   │   ├── useMethod.js                    # Hook for Meteor methods
│   │   ├── useSubscription.js              # Hook for Meteor subscriptions
│   │   └── useTracker.js                   # Hook for reactive data
│   └── utils/                              # Utility functions
│       ├── client/                         # Client-only utilities
│       │   ├── notifications.js            # Notification helpers
│       │   └── validation.js               # Form validation helpers
│       ├── server/                         # Server-only utilities
│       │   ├── email.js                    # Email sending utilities
│       │   └── permissions.js              # Permission checking utilities
│       └── common/                         # Shared utilities
│           ├── formatters.js               # Date/time formatters
│           └── constants.js                # Application constants
├── public/                                 # Public static assets
│   ├── assets/                             # NobleUI assets
│   │   ├── fonts/                          # Font files
│   │   ├── images/                         # Image files
│   │   │   ├── logo.svg                    # Application logo
│   │   │   ├── avatars/                    # Default avatar images
│   │   │   └── illustrations/              # UI illustrations
│   │   ├── js/                             # JavaScript files
│   │   │   └── nobleui.js                  # NobleUI JavaScript
│   │   └── scss/                           # SCSS files
│   │       ├── _variables.scss             # SCSS variables
│   │       ├── components/                 # Component styles
│   │       └── nobleui.scss                # Main NobleUI stylesheet
│   └── favicon.ico                         # Favicon
├── private/                                # Private files (server-only)
│   ├── email/                              # Email templates
│   │   ├── user-verification.html          # Email verification template
│   │   └── password-reset.html             # Password reset template
│   └── settings/                           # Settings files
│       ├── settings.development.json       # Development settings
│       └── settings.production.json        # Production settings
└── tests/                                  # Test files
    ├── api/                                # API tests
    │   ├── users.tests.js                  # User API tests
    │   └── faq.tests.js                    # FAQ API tests
    └── ui/                                 # UI tests
        ├── auth.tests.js                   # Authentication tests
        └── users.tests.js                  # User interface tests
```

## Key Concepts and Architecture

### Module System in Meteor 3.x

This application uses ES2015 modules with explicit imports/exports, which is the standard in Meteor 3.x. All application code is placed in the `imports/` directory and loaded on demand through explicit imports.

Key principles:
- Use named imports with curly braces: `import { Something } from '/imports/path'`
- Import Meteor packages with the `meteor/` prefix: `import { Meteor } from 'meteor/meteor'`
- Organize modules by functionality first, then by feature
- Use explicit imports in entry points (`client/main.js` and `server/main.js`)

### React Integration

React is the primary UI library, replacing Angular from the previous version:

- **Component-Based Structure**: Breaking UI into reusable components
- **React Router**: Declarative routing for React applications
- **React Hooks**: Functional components with state and lifecycle features
- **Context API**: Application-wide state management replacing Angular services
- **Custom Hooks**: Encapsulated Meteor-specific logic in reusable hooks

#### Key React Hooks for Meteor

```javascript
// Example of useTracker hook for reactive data
import { useTracker } from 'meteor/react-meteor-data';

function UserData() {
  const { user, isLoading } = useTracker(() => {
    const subscription = Meteor.subscribe('userData');
    const user = Meteor.user();
    return {
      user,
      isLoading: !subscription.ready() || !user
    };
  });

  if (isLoading) return <div>Loading...</div>;
  return <div>{user.profile.name}</div>;
}
```

### Styling with SCSS

The application uses SCSS for styling, with:
- NobleUI SCSS files imported in the main SCSS file
- Component-specific SCSS files co-located with components
- Variables and mixins for consistent styling
- Bootstrap 5 as the underlying CSS framework via NobleUI

### Authentication & Authorization Architecture

The app uses Meteor's built-in authentication system with enhancements:

- **User States**:
  - Unauthenticated
  - Authenticated but awaiting approval
  - Approved regular user
  - Admin user

- **Authorization Flow**:
  1. User registers account
  2. Account is created but marked as inactive
  3. Admin approves account through admin dashboard
  4. User receives notification and can now access the app

- **Role-Based Access Control**:
  - Uses `alanning:roles` package
  - Roles defined: 'admin', 'user'
  - UI components conditionally rendered based on roles
  - Routes protected based on user role

- **Security Measures**:
  - Method and publication checks
  - Rate limiting for sensitive operations
  - Client-side and server-side validation

## Implementation Details with Migration Examples

This section provides a concise overview of the key implementation differences when migrating from Meteor 2.5 + Angular to Meteor 3.x + React.

### Key Migration Points

#### Client Structure
- **Entry Point**: Change from Angular bootstrapping to React rendering
- **Component Architecture**: Transform Angular components/directives to React components
- **Templating**: Replace Angular templates with JSX
- **Styling**: Maintain SCSS but restructure to support React components

#### Server Changes
- **Async Code**: Convert synchronous code using fibers to async/await patterns
- **Collection Methods**: Replace direct collection operations with their async counterparts
- **Error Handling**: Update error handling patterns for promises

#### Data Layer
- **Reactivity**: Move from Angular's reactive patterns to React's `useTracker` hook
- **Subscriptions**: Implement subscriptions within React components or custom hooks
- **Method Calls**: Update method calls to use `Meteor.callAsync` or custom hooks

#### Authentication
- **User Authentication**: Create React components for auth forms and workflows
- **Protected Routes**: Implement route protection using React Router
- **User State Management**: Use React Context for managing user state

#### NobleUI Integration
- **Bootstrap 5**: Maintain Bootstrap classes from NobleUI
- **SCSS Variables**: Override NobleUI variables in a centralized location
- **Component Adaptation**: Adapt NobleUI components to React patterns

### Example Migration Patterns

1. **Angular Controllers → React Hooks**
   - Replace `$scope` with React's `useState` and `useEffect`
   - Move controller logic into function components or custom hooks

2. **Angular Services → React Context**
   - Replace services with React Context for global state
   - Create custom hooks to encapsulate service functionality

3. **Angular Routing → React Router**
   - Replace UI-Router states with React Router routes
   - Implement route guards with custom components

4. **Meteor Methods**
   - Update method calls to use async/await pattern
   - Replace Meteor collection methods with async alternatives:
     - `Collection.insert()` → `Collection.insertAsync()`
     - `Collection.update()` → `Collection.updateAsync()`
     - `Collection.remove()` → `Collection.removeAsync()`

5. **Publications/Subscriptions**
   - Implement subscriptions using `useTracker` hook
   - Update publications to use async patterns

### Custom Hooks for Meteor

The migration introduces several custom hooks that simplify common Meteor patterns:

1. **useMethod** - For simplified method calls with loading/error states
2. **useSubscription** - For managing Meteor subscriptions
3. **useTracker** - For reactive data from Meteor collections
4. **useAuth** - For authentication-related functionality

### NobleUI Integration Approach

NobleUI can be integrated with React by:

1. Importing the main SCSS file in the entry point
2. Overriding variables to customize the theme
3. Creating React components that utilize NobleUI's classes and structures
4. Managing responsive layouts through React component structure

## Authentication Features

The application includes comprehensive authentication features:

### User Registration Flow

1. **Registration Form**: Users can sign up with email, password, and basic profile information
2. **Verification Email**: Automatic email sent with verification link
3. **Admin Approval**: New accounts remain inactive until approved by admin
4. **Role Assignment**: Admin can assign user roles (admin/regular user)

### Authentication Components

- **Login Form**: Email/password authentication with "Remember Me" option
- **Registration Form**: New user registration with terms acceptance
- **Password Recovery**: Reset password via email link
- **Protected Routes**: Route-based access control using React Router

### Server-Side Configuration

- **User Creation Hook**: Custom logic on user creation (in `onCreateUser.js`)
- **Email Templates**: HTML email templates for verification and password reset
- **Rate Limiting**: Protection against brute force attacks
- **Password Policies**: Enforce strong passwords

## NobleUI Integration

The application integrates NobleUI admin template with React, including:

### Core Components

- **Navbar**: Top navigation with user dropdown, notifications
- **Sidebar**: Collapsible side navigation with menu items and user role-based visibility
- **Dashboard Cards**: Information cards and widgets for the home dashboard
- **Data Tables**: Tables with sorting, pagination for user management
- **Form Components**: Styled forms for user profile, registration, etc.

### Styling Approach

- **SCSS Variables**: Override NobleUI default theme colors in `_variables.scss`
- **Component-Specific Styles**: Co-located SCSS files with React components
- **Responsive Design**: Mobile-friendly layouts following NobleUI's responsive approach

## Running the Application

1. Install dependencies:
   ```
   meteor npm install
   ```

2. Start the application:
   ```
   meteor run --settings private/settings/settings.development.json
   ```

3. Visit `http://localhost:3000` in your browser

## Refactoring Strategies for Meteor 2.5 + Angular to Meteor 3.x + React

### Step 1: Setup and Configuration

1. **Create New Project Structure**:
   ```
   meteor create --react my-new-app
   ```

2. **Install Required Packages**:
   ```
   meteor add react-meteor-data          # React integration
   meteor add accounts-password          # Authentication
   meteor add alanning:roles            # Role-based authorization
   meteor npm install react-router-dom  # Routing
   ```

3. **Remove Angular Dependencies**:
   ```
   meteor remove angular-meteor
   meteor remove angular-templates
   ```

### Step 2: Convert Templates to Components

1. **Identify Angular Components**: Map existing Angular components to new React components

2. **Convert Templates**:
   - Angular templates (HTML) → JSX syntax
   - Angular controllers → React functional components with hooks
   - Angular services → React contexts or custom hooks
   - Angular directives → React components

3. **Example Conversion**:

   **Angular Template:**
   ```html
   <div class="user-list">
     <div ng-repeat="user in $ctrl.users" class="user-item">
       {{user.profile.name}}
       <button ng-click="$ctrl.activateUser(user._id)">Activate</button>
     </div>
   </div>
   ```

   **React Component:**
   ```jsx
   const UserList = () => {
     const { users } = useTracker(() => {
       const subscription = Meteor.subscribe('users.all');
       return {
         users: Meteor.users.find().fetch(),
         loading: !subscription.ready(),
       };
     });

     const activateUser = (userId) => {
       Meteor.call('users.activateUser', userId);
     };

     return (
       <div className="user-list">
         {users.map(user => (
           <div key={user._id} className="user-item">
             {user.profile.name}
             <button onClick={() => activateUser(user._id)}>
               Activate
             </button>
           </div>
         ))}
       </div>
     );
   };
   ```

### Step 3: Migrate Methods and Publications

1. **Update Methods**: Convert to async/await instead of callbacks

   **Before (Meteor 2.5):**
   ```javascript
   Meteor.methods({
     'users.activate': function(userId) {
       check(userId, String);
       // Synchronous code with fibers
       return Meteor.users.update(userId, { $set: { 'profile.active': true } });
     }
   });
   ```

   **After (Meteor 3.x):**
   ```javascript
   Meteor.methods({
     'users.activate': async function(userId) {
       check(userId, String);
       // Async code
       return await Meteor.users.updateAsync(userId, { $set: { 'profile.active': true } });
     }
   });
   ```

2. **Update Publications**: Convert to async iterations

   **Before (Meteor 2.5):**
   ```javascript
   Meteor.publish('users.all', function() {
     if (!Roles.userIsInRole(this.userId, 'admin')) {
       return this.ready();
     }
     return Meteor.users.find({}, { fields: { profile: 1, emails: 1, roles: 1 } });
   });
   ```

   **After (Meteor 3.x):**
   ```javascript
   Meteor.publish('users.all', async function() {
     if (!Roles.userIsInRole(this.userId, 'admin')) {
       return this.ready();
     }

     const usersCursor = Meteor.users.find({}, {
       fields: { profile: 1, emails: 1, roles: 1 }
     });

     // Using for await...of for async iteration
     for await (const user of usersCursor) {
       this.added('users', user._id, user);
     }

     this.ready();
   });
   ```

### Step 4: Convert Data Access Patterns

1. **Replace Angular Reactivity**:
   - Angular's `$scope.$watch` → React's `useState` and `useEffect`
   - Angular's reactive data → React's `useTracker` hook

2. **Replace Blaze Template Helpers**:
   - Blaze helpers → React props and component logic

3. **Example Data Access Pattern**:

   ```jsx
   import { useTracker } from 'meteor/react-meteor-data';
   import { UserCollection } from '/imports/api/users/collection';

   const UserProfile = ({ userId }) => {
     const { user, isLoading } = useTracker(() => {
       const subscription = Meteor.subscribe('users.single', userId);
       return {
         user: UserCollection.findOne(userId),
         isLoading: !subscription.ready(),
       };
     }, [userId]);

     if (isLoading) return <div>Loading...</div>;
     if (!user) return <div>User not found</div>;

     return (
       <div className="user-profile">
         <h1>{user.profile.name}</h1>
         {/* Profile content */}
       </div>
     );
   };
   ```

## Deployment

1. Build the application:
   ```
   meteor build --directory ../build
   ```

2. Navigate to the server directory:
   ```
   cd ../build/bundle/programs/server
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Set environment variables and start the application:
   ```
   METEOR_SETTINGS=$(cat settings.production.json) \
   ROOT_URL=http://your-app-url.com \
   MONGO_URL=mongodb://localhost:27017/your-app \
   PORT=3000 \
   node main.js
   ```

## Best Practices for Meteor 3.x + React

1. **Use async/await**: Meteor 3.x fully supports async/await syntax, moving away from fibers.

2. **Keep components small and focused**: Each component should do one thing well.

3. **Use React Hooks**: Prefer hooks over class components for state management.

4. **Create custom hooks for Meteor**: Encapsulate Meteor-specific logic in custom hooks:
   ```javascript
   // Custom hook for Meteor method calls
   export const useMethod = (methodName) => {
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState(null);

     const call = useCallback(async (...args) => {
       setLoading(true);
       setError(null);
       try {
         return await Meteor.callAsync(methodName, ...args);
       } catch (err) {
         setError(err);
         throw err;
       } finally {
         setLoading(false);
       }
     }, [methodName]);

     return { call, loading, error };
   };
   ```

5. **Validate data**: Use `check` and schemas to validate data before operations.

6. **Security first**: Always verify permissions on both client and server.

7. **Test your code**: Write unit and integration tests for critical functionality.

8. **Use TypeScript**: Consider using TypeScript for better type safety (optional).

9. **Avoid global state**: Use React Context API for state management instead of global variables.

10. **Optimize subscriptions**: Use smaller, targeted publications and subscribe only when necessary.

## Common Migration Challenges

1. **Asynchronous Code Conversion**: Converting synchronous code to async/await
   - Solution: Use `Meteor.callAsync`, `collection.updateAsync`, etc.

2. **React Component Lifecycle**: Different lifecycle management than Angular
   - Solution: Learn and use React hooks (`useEffect`, `useCallback`, etc.)

3. **State Management**: Angular services to React contexts
   - Solution: Create dedicated context providers and custom hooks

4. **Authentication Flow**: Moving from Angular auth to React auth
   - Solution: Use `useTracker` with Accounts system and React Router

5. **Managing Subscriptions**: Different subscription management
   - Solution: Move subscriptions to components with `useTracker` or custom hooks
