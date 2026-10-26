# Workspaces narrow the navigation, not access or fields

The admin navigation keeps growing (website, Minescapes, later intranet and WerkX), so each person
switches between workspaces that list only some navigation sections (`src/workspaces.ts`). A
workspace filters only the navigation and the dashboard: links, relationship fields and URLs still
open every collection, because collections reference each other across workspaces (Media is used
everywhere, a news item can link a mine). We therefore don't use Payload's `admin.hidden`, which
would also block those routes, and workspaces are not access control; restricting what someone
may edit stays the job of access rules.

Workspaces work on whole sections for now. Later the intranet, WerkX and the website will each
edit different parts of the same collection (e.g. a project); showing only the fields or tabs that
belong to the current workspace is left for then, when there is a second workspace to split for.
