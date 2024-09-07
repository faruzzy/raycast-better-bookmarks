import { homedir } from "os";
import { Bookmark, BookmarkData, BookmarkFile, Browser } from "../types";
import { getPreferenceValues } from "@raycast/api";
import { promisify } from "util";
import { readFile } from "fs";
import path from "path";

const BROWSER_PATHS: Record<Browser, string> = {
  chrome: "Google/Chrome",
  brave: "BraveSoftware/Brave-Browser",
};

const readFileAsync = promisify(readFile);

function getBookmarkData(
  currPath: string[],
  bookmark: Bookmark,
): BookmarkData[] {
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

async function loadBookmarkFile(browser: Browser): Promise<BookmarkFile> {
  const bookmarksFilePath = path.join(
    homedir(),
    "Library",
    "Application Support",
    BROWSER_PATHS[browser],
    "Default",
    "Bookmarks",
  );

  return JSON.parse(
    (await readFileAsync(bookmarksFilePath, "utf8")).toString(),
  ) as BookmarkFile;
}

export default async function getBookmarks(): Promise<BookmarkData[]> {
  const { defaultBrowser } = getPreferenceValues<Preferences>();
  const { roots } = await loadBookmarkFile(defaultBrowser);

  return Object.values(roots).flatMap(({ children }) => {
    return children.flatMap((bookmark) => getBookmarkData([], bookmark));
  });
}
