# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `yarn build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Document icons

The supplied Veeto PNG artwork is stored in `src/pages/Edge/images/fileIcons/veeto/` without image modifications. `utils/fileTypeIcons.js` provides the shared extension/MIME/filename mapping; `components/FileTypeIcon.js` renders it at the surrounding icon size. The legacy `returnFileIcon` and File Directory helpers use the same mapping, so document lists, Precedents/Forms, contacts, Safe Custody, staff attachments, Admin templates, folder trees, Team Precedents, binder indicators and report exports remain consistent.

Sent/received artwork recognises both `SENT`/`RECEIVED` and `OUTGOING`/`INCOMING`. Unknown email direction keeps the existing neutral email icon; ordinary folders keep their existing folder icon. Unknown file types use the supplied generic file icon. Navigation/action icons, paperclip tree connectors, provider logos, warnings and loaders retain their existing artwork. PNGs keep their original colours and aspect ratio; displayed sizes remain controlled by each existing view. Icon recognition does not change file filters, previews or upload/download behaviour.

Email direction is normalised through `utils/emailDirection.js` for the artwork, attachment Sent/Received labels and To/From details, and binder preview/index. `OUTGOING`/`SENT` mean Sent/To; `INCOMING`/`RECEIVED` mean Received/From. Missing or unrecognised directions show neutral email artwork and labels rather than defaulting to Received. This is display-only; stored email metadata and parser decisions are unchanged.

## Editing selected invoice time-billing entries

Selected time-billing rows open the existing editor with their owning matter ID. Service-line choices use hourly `{ display, value, raw }` options, and staff are requested afresh for every editor opening; there is no staff response cache. Both option requests finish before the editor opens, with a loading indicator and retryable load errors.

Saving an entry updates the underlying time-billing record immediately. The selected invoice row is then refreshed from the matter API to obtain server-calculated amounts and the new checksum. If refreshing fails after a successful update, **Retry refresh** repeats only the read, not the update. Existing main Time Billing refresh callbacks keep their no-argument behaviour. No calculation formulas or backend endpoints are changed.

The invoice **TIMED** picker uses compact bordered entries instead of repeated stacked field sections. Billing date, units and the recorded total share a line, with the full description below. The summary shows available/selected counts; only the drawer content scrolls. Add/Edit Invoice share this picker. Selection remains immediate, already-invoiced/selected records are excluded, and the existing billing-date/ID order is retained. Amounts are displayed from the saved entry without recalculation.

## Accounting invoice-list pagination

The invoice list keeps page number and page size in one pagination state and supplies both on every request. Choosing 100 rows therefore retains `pageSize=100` on Next, Previous and numbered-page navigation. Page-size changes and filter/sort refreshes start at page 1; Reset returns to page 1 with 25 rows. The visible range is updated alongside successful response rows. Failed or superseded requests cannot publish a mismatched range, and empty results cannot produce a negative page index. This change does not modify the shared pagination component or backend API.

## Continuous Xero export lists

Xero-connected Invoices and Payments show one scrollable list without page buttons or a page-size selector. The existing API pages are appended in batches of 100 when the end approaches. Load more and Retry remain available for keyboard access and failed requests. Filters, sorting and refresh replace the applied query and clear selections; typing unsubmitted filters does not change later batches of the currently displayed results. Selections persist while additional pages load. **Select all** selects only loaded records, including loaded rows outside the visible window; new batches are not silently selected.

Above 400 loaded records, fixed-height virtual rows render only the viewport and an overscan buffer. Spacer rows preserve scroll height; data and selection remain independent of mounted rows. Headers stay visible and the existing Post Invoice/Post Payment actions remain explicit. Duplicate row identities are filtered, page requests are serial, and old query responses are ignored. No new dependency or database migration is required. The backend adds stable invoice/payment identity tie-breakers for equal sort values. Offset pagination is not a frozen snapshot: refresh after records are added/exported by another user.

Validation uses the production build without adding test files or manually operating the application. Manual acceptance should cover more than 400 invoices/payments, scrolling in both directions, selection across batches, all-loaded selection, filters/sort/reset, slow/failed requests with Retry, tab switches and posting followed by refresh.


## Shared document browser ordering

Matter Attachments and Team Precedents use `DocumentFolders/documentSort.js` for both the left tree and right contents list, including embedded selection windows. At each folder level, ordinary folders appear first; email upload groups appear alongside files, using their source email upload date and display title. The selected Newest first/Name mode applies to both panels, to ordinary folders and to extracted email attachments. Names use natural numeric ordering (File 2 before File 10), with stable identity tie-breakers. Folder hierarchy, email expansion/protection and storage locations are unchanged. Unassigned files keep their separate tree section and follow the same sort mode.

Precedents/Forms selectors without a sort control use the same comparator in Name mode for folder/file listings. Destination dialogs use the owning browser's sort mode; the Team Precedent output-folder selector uses Name mode. This is display sorting, not workflow document generation order: Admin's explicitly arranged task/document sequence is preserved.
