# Decision Log

[2026-03-29] [NavBar/Access Control]
Decision: Hiding "My Dreams" and "Admin" navigation buttons for non-admin users.
Reason: User requested to restrict these features to admin users only as they are "of no use" for regular users.
Trade-off: Regular users still have access to the `/dashboard` route and can click the logo to go there, but the navigation links are removed from the UI to clean it up.
