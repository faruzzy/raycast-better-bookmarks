import { readFileSync } from "fs";
import { homedir } from "os";
import { Bookmark, BookmarkData, BookmarkFile, Browser } from "../types";

const BROWSER_PATHS: Record<Browser, string> = {
  chrome: "Google/Chrome",
  brave: "BraveSoftware/Brave-Browser",
};

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

export function loadBookmarkFile(browser: Browser): BookmarkFile {
  const bookmarksFilePath = `${homedir()}/Library/Application Support/${BROWSER_PATHS[browser]}/Default/Bookmarks`;

  return JSON.parse(readFileSync(bookmarksFilePath, "utf8").toString()) as BookmarkFile;
}

export default function getBookmarks(browser: Browser): BookmarkData[] {
  const { roots } = loadBookmarkFile(browser);

  return Object.values(roots).flatMap(({ children }) => {
    return children.flatMap((bookmark) => getBookmarkData([], bookmark));
  });
}
