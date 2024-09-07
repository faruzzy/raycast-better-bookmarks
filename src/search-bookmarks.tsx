import { List } from "@raycast/api";
import BookmarkRow from "./components/BookmarkRow";
import getBookmarks from "./utils/getBookmarks";
import { useCachedPromise } from "@raycast/utils";

export default function Command() {
  const { data: bookmarks, isLoading } = useCachedPromise(getBookmarks);

  return (
    <List isLoading={isLoading}>
      {bookmarks?.map((bookmark) => (
        <BookmarkRow key={bookmark.id} bookmark={bookmark} />
      ))}
    </List>
  );
}
