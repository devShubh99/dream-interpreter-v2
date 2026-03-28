# Decision Log

[2026-03-29] [NavBar/Access Control]
Decision: Hiding "My Dreams" and "Admin" navigation buttons for non-admin users.
Reason: User requested to restrict these features to admin users only as they are "of no use" for regular users.
Trade-off: Regular users still have access to the `/dashboard` route and can click the logo to go there, but the navigation links are removed from the UI to clean it up.

[2026-03-29] [UI/Accessibility]
Decision: Increasing contrast and readability for interpretation results.
Reason: The light purple secondary text was identified as difficult to read on the dark background.
Trade-off: Brighter text and glowing elements were added, moving slightly away from the "dim/misty" aesthetic for better usability and accessibility.
