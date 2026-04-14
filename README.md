# Surat Gym Hub - Frontend

This is the React frontend for the Surat Gym Hub administration panel. It uses Vite, React Router, React Query, and Zustand for state management.

## 1. Setup & Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
1. Clone the repository and navigate into the frontend directory.
2. Run `npm install` to install all dependencies.

### Environment Variables
Create a `.env` file in the root of the frontend folder and define your backend API base URL:

```env
VITE_API_URL=http://localhost:3000/api
```

### How to Run
- **Development Server:** Run `npm run dev` to start the local Vite server. The app will generally be available at `http://localhost:5173`.
- **Production Build:** Run `npm run build` to generate static files in the `dist` directory.

---

## 2. Routing: PrivateRoute & RoleRoute

The application enforces security at the routing level using two main components: `PrivateRoute` and `RoleRoute`. They work sequentially to protect the application.

- **`PrivateRoute`**: This component guards against unauthenticated access. It checks if there is a valid session (e.g., an access token exists). If the user is missing a token, it completely blocks the route and redirects them to the `/login` screen.
- **`RoleRoute`**: Nested inside or used alongside `PrivateRoute`, this component protects against unauthorized access. You pass the allowed roles (e.g., `['ADMIN', 'RECEPTIONIST']`) as props to this route. If an authenticated user does not have an approved role, `RoleRoute` redirects them away or renders a "403 Access Denied" block, preventing them from loading screens they shouldn't see.

**How they work together:**
If a user tries to access `/trainers`, `PrivateRoute` first checks "Are you logged in?" Then, `RoleRoute` checks "Are you an Admin or Receptionist?". If both are true, the layout renders perfectly.

---

## 3. UI Permissions (`usePermission` Hook)

Instead of manually checking `user.role === 'ADMIN'` repeatedly, the application uses a custom `usePermission` hook to handle granular UI gatekeeping. 

The `usePermission` hook acts as a central authority for access control. When invoked on a specific screen (e.g., the PT Sessions table), it returns boolean flags like `canBook`, `canEdit`, or `canViewTrainers`.

- **Hiding Buttons:** If `canBook` is false, the "Book Session" button is entirely stripped from the DOM.
- **Hiding Columns:** In data tables, table headers and cells are conditionally rendered. For example, the `Trainer` column can be omitted directly from the mapping loop if the current user shouldn't see it.
- **Hiding Pages:** Similar to `RoleRoute` but at a component level, specific panels or widgets can return `null` if the user's role isn't authorized, ensuring trainers don't stumble upon admin-only configuration blocks.

---

## 4. State Management & React Query Cache Invalidation

Data mutations (Register, Edit, Renew, and Cancel) immediately sync with the server using standard API calls. To keep the UI snappy and accurate without constantly hard-refreshing the page, we leverage **React Query Cache Invalidation**.

When a mutation occurs (like registering a new member or canceling a PT session):
1. **The Mutation Fires:** An API payload runs successfully.
2. **Invalidating Data (`queryClient.invalidateQueries`)**: Inside the `onSuccess` callback of the `useMutation` hook, React Query is instructed to invalidate specific keys (e.g., `['members']` or `['pt-sessions']`).
3. **Auto-Refetch:** React Query immediately marks its cached data as stale and actively triggers a background refetch for those specific keys.
4. **UI Updates Seamlessly:** The data table visually updates with the new member, the updated membership expiry date, or the newly canceled session status in real-time, eliminating the need for `window.location.reload()`.
