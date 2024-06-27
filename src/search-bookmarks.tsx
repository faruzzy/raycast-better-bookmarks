import { ActionPanel, Action, Icon, List, getPreferenceValues } from "@raycast/api";
import { readFileSync } from "fs";
import { Bookmark, BookmarkData, BookmarkFile } from "./types";
import { homedir } from "os";

// TODO: Caching

const { defaultBrowser } = getPreferenceValues<Preferences>();

const BROWSER_PATHS = {
  chrome: "Google/Chrome",
  brave: "BraveSoftware/Brave-Browser",
};
const bookmarksFilePath = `${homedir()}/Library/Application Support/${BROWSER_PATHS[defaultBrowser]}/Default/Bookmarks`;

const {
  roots: { bookmark_bar: bookmarkBar },
} = JSON.parse(readFileSync(bookmarksFilePath, "utf8").toString()) as BookmarkFile;

function getBookmarkData(currPath: string[], bookmark: Bookmark): BookmarkData[] {
  const newPath = [...currPath, bookmark.name];

  if (bookmark.type === "url") {
    return [
      {
        id: bookmark.guid,
        name: bookmark.name,
        folderPath: currPath,
        url: bookmark.url,
        fullPath: newPath,
      },
    ];
  }

  return bookmark.children.flatMap((child) => getBookmarkData(newPath, child));
}

const bookmarkData = bookmarkBar.children.flatMap((bookmark) => getBookmarkData([], bookmark));

export default function Command() {
  return (
    <List>
      {bookmarkData.map(({ id, name, folderPath, url, fullPath }) => (
        <List.Item
          key={id}
          icon={Icon.Bookmark}
          title={name}
          subtitle={url}
          keywords={fullPath}
          accessories={
            folderPath.length
              ? [
                  {
                    icon: Icon.Folder,
                    text: folderPath.join("/"),
                  },
                ]
              : []
          }
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={url} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
