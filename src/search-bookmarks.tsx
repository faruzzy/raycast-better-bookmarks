import { List, getPreferenceValues } from "@raycast/api";
import BookmarkRow from "./components/BookmarkRow";
import getBookmarks from "./utils/getBookmarks";

const { defaultBrowser } = getPreferenceValues<Preferences>();
const bookmarks = getBookmarks(defaultBrowser);

export default function Command() {
  return (
    <List>
      {bookmarks.map((bookmark) => (
        <BookmarkRow key={bookmark.id} bookmark={bookmark} />
      ))}
    </List>
  );
}
